import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { FixedCostForm } from "@/components/financeiro/fixed-cost-form"
import { FIXED_COST_CATEGORIES } from "@/lib/constants"

export default async function NovoCustoFixoPage() {
  const existing = await prisma.fixedCost.findMany({ select: { category: true }, distinct: ["category"] })
  const categories = Array.from(
    new Set([...FIXED_COST_CATEGORIES, ...existing.map((e) => e.category)])
  ).sort()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo custo fixo"
        description="Aluguel, energia, funcionários e outras despesas recorrentes"
        backHref="/financeiro/despesas-fixas"
      />
      <FixedCostForm categories={categories} />
    </div>
  )
}
