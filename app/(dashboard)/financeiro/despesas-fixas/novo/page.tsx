import { prisma } from "@/lib/prisma"
import { FixedCostForm } from "@/components/financeiro/fixed-cost-form"
import { FIXED_COST_CATEGORIES } from "@/lib/constants"

export default async function NovoCustoFixoPage() {
  const existing = await prisma.fixedCost.findMany({ select: { category: true }, distinct: ["category"] })
  const categories = Array.from(
    new Set([...FIXED_COST_CATEGORIES, ...existing.map((e) => e.category)])
  ).sort()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Novo custo fixo</h1>
      <FixedCostForm categories={categories} />
    </div>
  )
}
