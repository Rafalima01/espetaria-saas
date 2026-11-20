import { PageHeader } from "@/components/layout/page-header"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import { FixedCostReportsFilter } from "@/components/financeiro/fixed-cost-reports-filter"
import { FixedCostReportsCharts } from "@/components/financeiro/fixed-cost-reports-charts"
import { getFixedCostReports } from "@/lib/financeiro/getFixedCostReports"

export const dynamic = "force-dynamic"

export default async function RelatoriosCustosFixosPage() {
  const reports = await getFixedCostReports()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Financeiro" description="Custos fixos, fluxo de caixa e relatórios" />

      <FinanceiroNav />

      <FixedCostReportsFilter />
      <FixedCostReportsCharts {...reports} />
    </div>
  )
}
