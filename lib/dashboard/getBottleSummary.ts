import { prisma } from "@/lib/prisma"
import { getLastNDaysRange } from "@/lib/dates"
import { getFractionalStockDashboardSummary } from "@/lib/bottles/getFractionalStockSummary"

export async function getBottleDashboardSummary() {
  const { start, end } = getLastNDaysRange(30)

  const [
    dosesVendidas,
    garrafasAbertas,
    garrafasFinalizadas,
    doseSaleItems,
    lossMovements,
    mlVendidosAgg,
    garrafasVendidas,
    fractionalStock,
  ] = await Promise.all([
    prisma.doseSaleItem.count({
      where: { mode: "DOSE", cancelledAt: null, sale: { createdAt: { gte: start, lt: end } } },
    }),
    prisma.bottleInstance.count({ where: { status: "OPEN" } }),
    prisma.bottleInstance.count({ where: { status: "EMPTY" } }),
    prisma.doseSaleItem.findMany({
      where: { cancelledAt: null, sale: { createdAt: { gte: start, lt: end } } },
      include: { product: { select: { name: true } } },
    }),
    prisma.bottleMovement.aggregate({
      where: { type: "LOSS", createdAt: { gte: start, lt: end } },
      _sum: { volumeMl: true, units: true },
    }),
    prisma.doseSaleItem.aggregate({
      where: {
        mode: { in: ["DOSE", "HALF_BOTTLE"] },
        cancelledAt: null,
        sale: { createdAt: { gte: start, lt: end } },
      },
      _sum: { volumeMl: true },
    }),
    prisma.doseSaleItem.count({
      where: { mode: "FULL_BOTTLE", cancelledAt: null, sale: { createdAt: { gte: start, lt: end } } },
    }),
    getFractionalStockDashboardSummary(),
  ])

  const totalProfit = doseSaleItems.reduce(
    (sum, item) => sum + (item.unitPrice - item.costPriceSnapshot),
    0
  )

  const profitByBottle = new Map<string, number>()
  const quantityByDose = new Map<string, { label: string; quantity: number }>()
  for (const item of doseSaleItems) {
    profitByBottle.set(
      item.product.name,
      (profitByBottle.get(item.product.name) ?? 0) + (item.unitPrice - item.costPriceSnapshot)
    )
    const doseKey = `${item.product.name} ${item.volumeMl}ml`
    const entry = quantityByDose.get(doseKey) ?? { label: doseKey, quantity: 0 }
    entry.quantity += 1
    quantityByDose.set(doseKey, entry)
  }

  const topProfitable = [...profitByBottle.entries()].sort((a, b) => b[1] - a[1])[0]
  const topDose = [...quantityByDose.values()].sort((a, b) => b.quantity - a.quantity)[0]

  const closedInstances = await prisma.bottleInstance.findMany({
    where: { status: "EMPTY" },
    include: { movements: { where: { type: "DOSE_SALE" } } },
  })
  const averageYield =
    closedInstances.length > 0
      ? closedInstances.reduce((sum, inst) => sum + inst.movements.length, 0) /
        closedInstances.length
      : 0

  return {
    dosesVendidas,
    garrafasAbertas,
    garrafasFinalizadas,
    totalProfit,
    mostProfitableBottle: topProfitable?.[0] ?? "-",
    bestSellingDose: topDose?.label ?? "-",
    averageYieldPerBottle: Math.round(averageYield * 10) / 10,
    wasteVolumeMl: lossMovements._sum.volumeMl ?? 0,
    wasteUnits: lossMovements._sum.units ?? 0,
    mlVendidos: mlVendidosAgg._sum.volumeMl ?? 0,
    garrafasVendidas,
    volumeRestanteTotal: fractionalStock.volumeDisponivel,
  }
}
