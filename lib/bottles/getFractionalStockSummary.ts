import { prisma } from "@/lib/prisma"
import { getLastNDaysRange } from "@/lib/dates"

export type FractionalStockSummary = {
  physicalBottles: number
  totalVolumeMl: number
  percentRemaining: number
  dosesRemaining: number | null
}

type ProductForSummary = { stock: number; volumeMl: number | null; defaultDoseMl: number | null }
type OpenInstance = { remainingMl: number }

/**
 * Derives garrafas físicas / volume restante / % restante / doses restantes for a
 * FRACTIONAL product from its current stock + open BottleInstance rows — never
 * stored, always recomputed (same pattern as getCustomerBalance/getLowStockAlerts).
 */
export function computeFractionalStockSummary(
  product: ProductForSummary,
  openInstances: OpenInstance[]
): FractionalStockSummary {
  const volumeMl = product.volumeMl ?? 0
  const sealedBottles = product.stock
  const physicalBottles = sealedBottles + openInstances.length
  const openVolumeMl = openInstances.reduce((sum, i) => sum + i.remainingMl, 0)
  const totalVolumeMl = sealedBottles * volumeMl + openVolumeMl
  const capacityMl = physicalBottles * volumeMl
  const percentRemaining = capacityMl > 0 ? (totalVolumeMl / capacityMl) * 100 : 0
  const dosesRemaining = product.defaultDoseMl ? Math.floor(totalVolumeMl / product.defaultDoseMl) : null

  return { physicalBottles, totalVolumeMl, percentRemaining, dosesRemaining }
}

/** Dashboard-wide aggregate across all active FRACTIONAL products. */
export async function getFractionalStockDashboardSummary() {
  const { start, end } = getLastNDaysRange(30)

  const products = await prisma.product.findMany({
    where: { active: true, productType: "FRACTIONAL" },
    include: { instances: { where: { status: "OPEN" } } },
  })

  let volumeDisponivel = 0
  let dosesRestantesTotal = 0
  for (const product of products) {
    const summary = computeFractionalStockSummary(product, product.instances)
    volumeDisponivel += summary.totalVolumeMl
    dosesRestantesTotal += summary.dosesRemaining ?? 0
  }

  const consumptionMovements = await prisma.bottleMovement.aggregate({
    where: {
      type: { in: ["DOSE_SALE", "HALF_BOTTLE_SALE", "RECIPE_SALE"] },
      createdAt: { gte: start, lt: end },
    },
    _sum: { volumeMl: true },
  })
  const fullBottleSalesConsumed = await prisma.doseSaleItem.aggregate({
    where: { mode: "FULL_BOTTLE", cancelledAt: null, sale: { createdAt: { gte: start, lt: end } } },
    _sum: { volumeMl: true },
  })

  const volumeConsumido = (consumptionMovements._sum.volumeMl ?? 0) + (fullBottleSalesConsumed._sum.volumeMl ?? 0)
  const percentualConsumido =
    volumeConsumido + volumeDisponivel > 0
      ? (volumeConsumido / (volumeConsumido + volumeDisponivel)) * 100
      : 0

  return { volumeDisponivel, volumeConsumido, dosesRestantesTotal, percentualConsumido }
}
