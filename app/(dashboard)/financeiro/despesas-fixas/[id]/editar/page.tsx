import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FixedCostForm } from "@/components/financeiro/fixed-cost-form"
import { FIXED_COST_CATEGORIES } from "@/lib/constants"

export default async function EditarCustoFixoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [fixedCost, existing] = await Promise.all([
    prisma.fixedCost.findUnique({ where: { id } }),
    prisma.fixedCost.findMany({ select: { category: true }, distinct: ["category"] }),
  ])
  if (!fixedCost) notFound()

  const categories = Array.from(
    new Set([...FIXED_COST_CATEGORIES, ...existing.map((e) => e.category)])
  ).sort()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Editar custo fixo</h1>
      <FixedCostForm fixedCost={fixedCost} categories={categories} />
    </div>
  )
}
