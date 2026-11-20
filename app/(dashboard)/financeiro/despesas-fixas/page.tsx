import Link from "next/link"
import { CheckCircle2, Clock, AlertTriangle, Wallet, Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import { FixedCostTable } from "@/components/financeiro/fixed-cost-table"
import { ensureFixedCostEntries } from "@/lib/financeiro/ensureFixedCostEntries"
import { FIXED_COST_DUE_SOON_DAYS } from "@/lib/constants"
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financeiro"
        description="Custos fixos, fluxo de caixa e relatórios"
        actions={
          <Button
            className="h-10 rounded-xl px-4"
            render={<Link href="/financeiro/despesas-fixas/novo" />}
            nativeButton={false}
          >
            <Plus className="size-4" />
            Novo custo fixo
          </Button>
        }
      />

      <FinanceiroNav />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          highlight
          title="Total pendente no mês"
          value={centsToBRL(totalPendenteMes)}
          icon={Wallet}
        />
        <SummaryCard title="Total pago no mês" value={centsToBRL(totalPagoMes)} icon={CheckCircle2} />
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
