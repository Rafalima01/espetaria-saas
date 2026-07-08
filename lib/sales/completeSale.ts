import { prisma } from "@/lib/prisma"
import type { CreateSaleInput } from "@/lib/validations/sale"
import { getDosePricing } from "@/lib/bottles/computeDoseSaleItem"
import { getRecipePricing } from "@/lib/recipes/computeRecipeSaleItem"
import { consumeBottleVolume, InsufficientBottleStockError } from "@/lib/bottles/consumeVolume"
import { getStockStatus } from "@/lib/stock/getStockStatus"

export class InsufficientStockError extends Error {
  constructor(public productName: string) {
    super(`Estoque insuficiente para "${productName}"`)
  }
}

export class CustomerBlockedError extends Error {
  constructor() {
    super("Cliente fiado está bloqueado")
  }
}

type DoseRowData = {
  productId: string
  doseSizeId?: string
  mode: "DOSE" | "HALF_BOTTLE" | "FULL_BOTTLE"
  volumeMl: number
  unitPrice: number
  costPriceSnapshot: number
  discount: number
  total: number
  note?: string
}

export async function completeSale(input: CreateSaleInput, userId: string) {
  const paymentsTotal = input.payments.reduce((sum, p) => sum + p.amount, 0)

  return prisma.$transaction(async (tx) => {
    // ---- product items ----
    const productIds = input.items.map((i) => i.productId)
    const products = await tx.product.findMany({ where: { id: { in: productIds } } })
    const productMap = new Map(products.map((p) => [p.id, p]))

    let subtotal = 0
    const itemsData = input.items.map((item) => {
      const product = productMap.get(item.productId)
      if (!product) throw new Error("PRODUCT_NOT_FOUND")
      if (product.stock < item.quantity) throw new InsufficientStockError(product.name)

      const total = product.salePrice * item.quantity - item.discount + item.surcharge
      subtotal += total

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        costPriceSnapshot: product.purchasePrice,
        discount: item.discount,
        surcharge: item.surcharge,
        total,
        note: item.note || undefined,
      }
    })

    // ---- dose items ----
    // A cart line with quantity N expands into N DoseSaleItem rows (one per
    // physical unit), since each unit may draw from a different bottle
    // instance once the currently-open one runs out.
    const doseRowsData: DoseRowData[] = []
    for (const doseItem of input.doseItems) {
      const pricing = await getDosePricing(tx, doseItem)
      for (let i = 0; i < doseItem.quantity; i++) {
        const unitDiscount = i === 0 ? doseItem.discount : 0
        const total = pricing.unitPrice - unitDiscount
        subtotal += total
        doseRowsData.push({
          productId: doseItem.productId,
          doseSizeId: doseItem.doseSizeId,
          mode: doseItem.mode,
          volumeMl: pricing.volumeMl,
          unitPrice: pricing.unitPrice,
          costPriceSnapshot: pricing.costPriceSnapshot,
          discount: unitDiscount,
          total,
          note: doseItem.note || undefined,
        })
      }
    }

    // ---- recipe items ----
    const recipeRowsData: {
      recipeId: string
      quantity: number
      unitPrice: number
      costPriceSnapshot: number
      discount: number
      total: number
      note?: string
      cupProductId: string | null
      ingredients: { productId: string; productType: "SIMPLE" | "FRACTIONAL"; volumeMl: number | null }[]
    }[] = []
    for (const recipeItem of input.recipeItems) {
      const pricing = await getRecipePricing(tx, recipeItem.recipeId)
      const total = pricing.unitPrice * recipeItem.quantity - recipeItem.discount
      subtotal += total
      recipeRowsData.push({
        recipeId: recipeItem.recipeId,
        quantity: recipeItem.quantity,
        unitPrice: pricing.unitPrice,
        costPriceSnapshot: pricing.costPriceSnapshot,
        discount: recipeItem.discount,
        total,
        note: recipeItem.note || undefined,
        cupProductId: pricing.cupProductId,
        ingredients: pricing.ingredients,
      })
    }

    const total = subtotal - input.discount + input.surcharge
    if (paymentsTotal !== total) {
      throw new Error("PAYMENTS_MISMATCH")
    }

    // ---- fiado pre-check (server never blocks on credit limit, only on BLOCKED status) ----
    const fiadoPayment = input.payments.find((p) => p.method === "FIADO")
    if (fiadoPayment) {
      const customer = await tx.creditCustomer.findUnique({
        where: { id: input.creditCustomerId! },
      })
      if (!customer) throw new Error("CUSTOMER_NOT_FOUND")
      if (customer.status === "BLOCKED") throw new CustomerBlockedError()
    }

    // ---- create Sale + product items + recipe items + payments ----
    const sale = await tx.sale.create({
      data: {
        status: "COMPLETED",
        subtotal,
        discount: input.discount,
        surcharge: input.surcharge,
        total,
        userId,
        items: { create: itemsData },
        recipeSaleItems: {
          create: recipeRowsData.map(({ ingredients: _ingredients, cupProductId: _cupProductId, ...rest }) => rest),
        },
        payments: { create: input.payments },
      },
      include: { items: true, payments: true, recipeSaleItems: true },
    })

    // ---- product stock ----
    const lowStockWarnings: { productId: string; name: string; stock: number; minStock: number; status: "LOW" | "CRITICAL" }[] = []
    async function decrementSimpleStock(productId: string, quantity: number, movementType: "SALE" | "RECIPE_SALE") {
      const updated = await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      })
      await tx.stockMovement.create({
        data: {
          productId,
          type: movementType,
          quantity,
          userId,
          saleId: sale.id,
        },
      })
      const status = getStockStatus(updated.stock, updated.minStock)
      if (status !== "NORMAL") {
        lowStockWarnings.push({
          productId: updated.id,
          name: updated.name,
          stock: updated.stock,
          minStock: updated.minStock,
          status,
        })
      }
    }

    for (const item of itemsData) {
      await decrementSimpleStock(item.productId, item.quantity, "SALE")
    }

    // ---- dose stock + DoseSaleItem rows (created after consuming, so we know the instance) ----
    for (const doseRow of doseRowsData) {
      let bottleInstanceId: string | null = null
      if (doseRow.mode === "FULL_BOTTLE") {
        const product = await tx.product.findUniqueOrThrow({ where: { id: doseRow.productId } })
        if (product.stock < 1) throw new InsufficientBottleStockError(product.name)
        await tx.product.update({ where: { id: doseRow.productId }, data: { stock: { decrement: 1 } } })
        await tx.bottleMovement.create({
          data: {
            productId: doseRow.productId,
            type: "FULL_BOTTLE_SALE",
            units: 1,
            userId,
            saleId: sale.id,
          },
        })
      } else {
        bottleInstanceId = await consumeBottleVolume(tx, doseRow.productId, doseRow.volumeMl, {
          saleId: sale.id,
          userId,
          movementType: doseRow.mode === "DOSE" ? "DOSE_SALE" : "HALF_BOTTLE_SALE",
        })
      }
      await tx.doseSaleItem.create({
        data: { saleId: sale.id, bottleInstanceId, ...doseRow },
      })
    }

    // ---- recipe ingredient + cup stock ----
    for (const recipeRow of recipeRowsData) {
      for (let q = 0; q < recipeRow.quantity; q++) {
        for (const ing of recipeRow.ingredients) {
          if (ing.productType === "FRACTIONAL" && ing.volumeMl) {
            await consumeBottleVolume(tx, ing.productId, ing.volumeMl, {
              saleId: sale.id,
              userId,
              movementType: "RECIPE_SALE",
            })
          } else {
            await decrementSimpleStock(ing.productId, 1, "RECIPE_SALE")
          }
        }
        if (recipeRow.cupProductId) {
          await decrementSimpleStock(recipeRow.cupProductId, 1, "RECIPE_SALE")
        }
      }
    }

    // ---- fiado receivable ----
    if (fiadoPayment) {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await tx.financialEntry.create({
        data: {
          type: "RECEIVABLE",
          description: `Venda #${sale.id.slice(-6)} - Fiado`,
          amount: fiadoPayment.amount,
          status: "OPEN",
          dueDate,
          creditCustomerId: input.creditCustomerId,
          saleId: sale.id,
        },
      })
    }

    return { ...sale, lowStockWarnings }
  })
}
