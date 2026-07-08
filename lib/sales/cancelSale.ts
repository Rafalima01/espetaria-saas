import { prisma } from "@/lib/prisma"
import { restoreBottleVolume } from "@/lib/bottles/consumeVolume"

export async function cancelSale(saleId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { items: true, doseSaleItems: true, recipeSaleItems: true },
    })
    if (!sale) throw new Error("SALE_NOT_FOUND")
    if (sale.status === "CANCELLED") throw new Error("ALREADY_CANCELLED")

    for (const item of sale.items) {
      if (item.cancelledAt) continue
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "ADJUSTMENT",
          quantity: item.quantity,
          reason: "Estorno por cancelamento de venda",
          userId,
          saleId: sale.id,
        },
      })
    }

    for (const doseItem of sale.doseSaleItems) {
      if (doseItem.cancelledAt) continue
      if (doseItem.mode === "FULL_BOTTLE") {
        await tx.product.update({
          where: { id: doseItem.productId },
          data: { stock: { increment: 1 } },
        })
        await tx.bottleMovement.create({
          data: {
            productId: doseItem.productId,
            type: "RESTORE",
            units: 1,
            reason: "Estorno por cancelamento de venda",
            userId,
            saleId: sale.id,
          },
        })
      } else if (doseItem.bottleInstanceId) {
        await restoreBottleVolume(tx, doseItem.bottleInstanceId, doseItem.volumeMl, {
          saleId: sale.id,
          userId,
        })
      }
    }

    if (sale.recipeSaleItems.some((r) => !r.cancelledAt)) {
      // Ingredients aren't snapshotted on RecipeSaleItem, so reconstruct what was
      // actually consumed from the audit trail written by completeSale: ml-based
      // (FRACTIONAL) consumption via BottleMovement, unit-based (SIMPLE, incl. the
      // recipe's cup) consumption via StockMovement — both tagged type RECIPE_SALE.
      const [recipeBottleMovements, recipeStockMovements] = await Promise.all([
        tx.bottleMovement.findMany({ where: { saleId: sale.id, type: "RECIPE_SALE" } }),
        tx.stockMovement.findMany({ where: { saleId: sale.id, type: "RECIPE_SALE" } }),
      ])
      for (const movement of recipeBottleMovements) {
        if (!movement.bottleInstanceId || !movement.volumeMl) continue
        await restoreBottleVolume(tx, movement.bottleInstanceId, movement.volumeMl, {
          saleId: sale.id,
          userId,
        })
      }
      for (const movement of recipeStockMovements) {
        await tx.product.update({
          where: { id: movement.productId },
          data: { stock: { increment: movement.quantity } },
        })
        await tx.stockMovement.create({
          data: {
            productId: movement.productId,
            type: "ADJUSTMENT",
            quantity: movement.quantity,
            reason: "Estorno por cancelamento de venda",
            userId,
            saleId: sale.id,
          },
        })
      }
    }

    return tx.sale.update({
      where: { id: saleId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    })
  })
}
