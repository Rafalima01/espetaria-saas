import type { Prisma } from "@/lib/generated/prisma/client"

export class InsufficientBottleStockError extends Error {
  constructor(public productName: string) {
    super(`Estoque insuficiente de unidades seladas para "${productName}"`)
  }
}

export class InvalidVolumeError extends Error {
  constructor() {
    super("Volume solicitado maior que o volume do produto")
  }
}

type ConsumeParams = {
  saleId: string
  userId: string
  movementType: "DOSE_SALE" | "HALF_BOTTLE_SALE" | "RECIPE_SALE"
}

/**
 * Consumes `volumeMl` from the given product's open stock, following FIFO across
 * open instances. If no open instance has enough remaining ml, opens a fresh
 * sealed unit (decrementing Product.stock) rather than trying to consolidate
 * leftovers across multiple partially-open instances — a documented limitation,
 * not a bug. Returns the id of the BottleInstance that served the request.
 *
 * Not locked explicitly: SQLite (via the better-sqlite3 driver adapter) serializes
 * writes per transaction, so concurrent dose sales draining the same instance
 * can't race in practice.
 */
export async function consumeBottleVolume(
  tx: Prisma.TransactionClient,
  productId: string,
  volumeMl: number,
  { saleId, userId, movementType }: ConsumeParams
): Promise<string> {
  const product = await tx.product.findUniqueOrThrow({ where: { id: productId } })
  if (!product.volumeMl || volumeMl > product.volumeMl) throw new InvalidVolumeError()

  const instance = await tx.bottleInstance.findFirst({
    where: { productId, status: "OPEN", remainingMl: { gte: volumeMl } },
    orderBy: { openedAt: "asc" },
  })

  if (instance) {
    const remainingMl = instance.remainingMl - volumeMl
    await tx.bottleInstance.update({
      where: { id: instance.id },
      data: {
        remainingMl,
        status: remainingMl === 0 ? "EMPTY" : "OPEN",
        closedAt: remainingMl === 0 ? new Date() : undefined,
      },
    })
    await tx.bottleMovement.create({
      data: {
        productId,
        bottleInstanceId: instance.id,
        type: movementType,
        volumeMl,
        userId,
        saleId,
      },
    })
    return instance.id
  }

  if (product.stock < 1) throw new InsufficientBottleStockError(product.name)

  await tx.product.update({ where: { id: productId }, data: { stock: { decrement: 1 } } })

  const remainingMl = product.volumeMl - volumeMl
  const newInstance = await tx.bottleInstance.create({
    data: {
      productId,
      remainingMl,
      status: remainingMl === 0 ? "EMPTY" : "OPEN",
      closedAt: remainingMl === 0 ? new Date() : undefined,
      openedByUserId: userId,
    },
  })

  await tx.bottleMovement.create({
    data: { productId, bottleInstanceId: newInstance.id, type: "OPEN", units: 1, userId, saleId },
  })
  await tx.bottleMovement.create({
    data: {
      productId,
      bottleInstanceId: newInstance.id,
      type: movementType,
      volumeMl,
      userId,
      saleId,
    },
  })

  return newInstance.id
}

/**
 * Reverses a dose/recipe-ingredient consumption on sale cancellation. If the
 * serving instance is still OPEN, restores the ml. If it has since gone EMPTY
 * (unit already closed/replaced), the ml is not resurrected — that volume is
 * an accepted, documented inventory loss — but a RESTORE movement is still
 * written for audit visibility.
 */
export async function restoreBottleVolume(
  tx: Prisma.TransactionClient,
  bottleInstanceId: string,
  volumeMl: number,
  { saleId, userId }: { saleId: string; userId: string }
) {
  const instance = await tx.bottleInstance.findUniqueOrThrow({ where: { id: bottleInstanceId } })

  if (instance.status === "OPEN") {
    const product = await tx.product.findUniqueOrThrow({ where: { id: instance.productId } })
    const remainingMl = Math.min(product.volumeMl ?? instance.remainingMl, instance.remainingMl + volumeMl)
    await tx.bottleInstance.update({ where: { id: instance.id }, data: { remainingMl } })
    await tx.bottleMovement.create({
      data: {
        productId: instance.productId,
        bottleInstanceId: instance.id,
        type: "RESTORE",
        volumeMl,
        userId,
        saleId,
      },
    })
  } else {
    await tx.bottleMovement.create({
      data: {
        productId: instance.productId,
        bottleInstanceId: instance.id,
        type: "RESTORE",
        volumeMl: 0,
        reason: "Não restaurado — unidade já fechada",
        userId,
        saleId,
      },
    })
  }
}
