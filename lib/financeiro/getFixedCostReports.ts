import { prisma } from "@/lib/prisma"

export async function getFixedCostReports() {
  const entries = await prisma.financialEntry.findMany({
    where: { type: "PAYABLE", competencia: { not: null } },
    include: { fixedCost: true },
  })

  const byMonthMap = new Map<string, number>()
  const byCategoryMap = new Map<string, number>()
  for (const e of entries) {
    const competencia = e.competencia as string
    byMonthMap.set(competencia, (byMonthMap.get(competencia) ?? 0) + e.amount)
    const category = e.fixedCost?.category ?? "Outros"
    byCategoryMap.set(category, (byCategoryMap.get(category) ?? 0) + e.amount)
  }

  const byMonth = [...byMonthMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([competencia, total]) => ({ competencia, total: total / 100 }))

  const byCategory = [...byCategoryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => ({ category, total: total / 100 }))

  return {
    byMonth,
    byCategory,
    evolution: byMonth,
    comparison: byMonth.slice(-6),
  }
}
