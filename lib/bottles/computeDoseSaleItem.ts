import type { Prisma } from "@/lib/generated/prisma/client"

export class BottleNotFoundError extends Error {
  constructor() {
    super("Produto não encontrado")
  }
}

export class ProductNotFractionalError extends Error {
  constructor(productName: string) {
    super(`"${productName}" não é um produto do tipo Bebida Fracionada`)
  }
}

export class DosePriceNotConfiguredError extends Error {
  constructor(productName: string) {
    super(`Preço não configurado para essa dose de "${productName}"`)
  }
}

export class FullBottlePriceNotConfiguredError extends Error {
  constructor(productName: string) {
    super(`Preço de unidade inteira não configurado para "${productName}"`)
  }
}

export type DosePricing = {
  bottleName: string
  volumeMl: number
  unitPrice: number // cents
  costPriceSnapshot: number // cents
}

/**
 * Resolves the server-side price/volume/cost for one unit of a dose sale line,
 * for any of the three sale modes. Never trusts client-supplied prices.
 */
export async function getDosePricing(
  tx: Prisma.TransactionClient,
  input: { productId: string; doseSizeId?: string; mode: "DOSE" | "HALF_BOTTLE" | "FULL_BOTTLE" }
): Promise<DosePricing> {
  const product = await tx.product.findUnique({ where: { id: input.productId } })
  if (!product) throw new BottleNotFoundError()
  if (product.productType !== "FRACTIONAL" || !product.volumeMl) {
    throw new ProductNotFractionalError(product.name)
  }

  if (input.mode === "FULL_BOTTLE") {
    if (!product.fullBottleSalePrice) throw new FullBottlePriceNotConfiguredError(product.name)
    return {
      bottleName: product.name,
      volumeMl: product.volumeMl,
      unitPrice: product.fullBottleSalePrice,
      costPriceSnapshot: product.purchasePrice,
    }
  }

  if (input.mode === "HALF_BOTTLE") {
    if (!product.fullBottleSalePrice) throw new FullBottlePriceNotConfiguredError(product.name)
    const volumeMl = Math.floor(product.volumeMl / 2)
    return {
      bottleName: product.name,
      volumeMl,
      unitPrice: Math.round(product.fullBottleSalePrice / 2),
      costPriceSnapshot: Math.round((product.purchasePrice / product.volumeMl) * volumeMl),
    }
  }

  // mode === "DOSE"
  if (!input.doseSizeId) throw new DosePriceNotConfiguredError(product.name)
  const dosePrice = await tx.bottleDosePrice.findUnique({
    where: { productId_doseSizeId: { productId: input.productId, doseSizeId: input.doseSizeId } },
    include: { doseSize: true },
  })
  if (!dosePrice) throw new DosePriceNotConfiguredError(product.name)

  return {
    bottleName: product.name,
    volumeMl: dosePrice.doseSize.volumeMl,
    unitPrice: dosePrice.salePrice,
    costPriceSnapshot: Math.round(
      (product.purchasePrice / product.volumeMl) * dosePrice.doseSize.volumeMl
    ),
  }
}
