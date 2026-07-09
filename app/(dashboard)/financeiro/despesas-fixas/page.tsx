import Link from "next/link"
import { CheckCircle2, Clock, AlertTriangle, Wallet } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import { FixedCostTable } from "@/components/financeiro/fixed-cost-table"
import { ensureFixedCostEntries } from "@/lib/financeiro/ensureFixedCostEntries"
import { FIXED_COST_DUE_SOON_DAYS, FIXED_COST_CATEGORIES } from "@/lib/constants"
import { getMonthRange } from "@/lib/dates"
import { centsToBRL } from "@/lib/money"

export const dynamic = "force-dynamic"

export default async function DespesasFixasPage() {
  await ensureFixedCostEntries()

  const entries = await prisma.financialEntry.findMany({
    where: { type: "PAYABLE", competencia: { not: null } },
    include: { fixedCost: true, payments: true },
    orderBy: { dueDate: "desc" },
  })

  const { start, end } = getMonthRange()
  const monthEntries = entries.filter((e) => e.dueDate >= start && e.dueDate < end)
  const now = new Date()
  const dueSoonThreshold = new Date(now.getTime() + FIXED_COST_DUE_SOON_DAYS * 24 * 60 * 60 * 1000)

  const totalPagoMes = monthEntries
    .filter((e) => e.status === "PAID")
    .reduce((sum, e) => sum + e.amount, 0)
  const pendingMonthEntries = monthEntries.filter((e) => ["OPEN", "PARTIALLY_PAID"].includes(e.status))
  const totalPendenteMes = pendingMonthEntries.reduce((sum, e) => sum + e.amount, 0)
  const proximosVencimentos = pendingMonthEntries.filter(
    (e) => e.dueDate >= now && e.dueDate <= dueSoonThreshold
  ).length
  const custosVencidos = pendingMonthEntries.filter((e) => e.dueDate < now).length

  const existingCategories = Array.from(new Set(entries.map((e) => e.fixedCost?.category).filter((v): v is string => !!v)))
  const categories = Array.from(new Set([...FIXED_COST_CATEGORIES, ...existingCategories])).sort()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <p className="text-muted-foreground">Custos fixos, fluxo de caixa e relatórios</p>
      </div>

      <FinanceiroNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Despesas Fixas</h2>
          <p className="text-sm text-muted-foreground">{categories.length} categoria(s) disponível(is)</p>
        </div>
        <Button render={<Link href="/financeiro/despesas-fixas/novo" />} nativeButton={false}>
          Novo custo fixo
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard title="Total pago no mês" value={centsToBRL(totalPagoMes)} icon={CheckCircle2} />
        <SummaryCard title="Total pendente" value={centsToBRL(totalPendenteMes)} icon={Wallet} />
        <SummaryCard title="Próximos vencimentos" value={String(proximosVencimentos)} icon={Clock} />
        <SummaryCard title="Custos vencidos" value={String(custosVencidos)} icon={AlertTriangle} />
      </div>

      <FixedCostTable
        entries={entries.map((e) => ({
          id: e.id,
          description: e.description,
          amount: e.amount,
          status: e.status,
          dueDate: e.dueDate,
          competencia: e.competencia,
          fixedCost: e.fixedCost
            ? {
                id: e.fixedCost.id,
                name: e.fixedCost.name,
                category: e.fixedCost.category,
                paymentMethod: e.fixedCost.paymentMethod,
                recurrence: e.fixedCost.recurrence,
              }
            : null,
          payments: e.payments.map((p) => ({ amount: p.amount })),
        }))}
      />
    </div>
  )
}
