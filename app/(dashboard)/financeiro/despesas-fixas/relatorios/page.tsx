import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import { FixedCostReportsFilter } from "@/components/financeiro/fixed-cost-reports-filter"
import { FixedCostReportsCharts } from "@/components/financeiro/fixed-cost-reports-charts"
import { getFixedCostReports } from "@/lib/financeiro/getFixedCostReports"

export const dynamic = "force-dynamic"

export default async function RelatoriosCustosFixosPage() {
  const reports = await getFixedCostReports()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <p className="text-muted-foreground">Custos fixos, fluxo de caixa e relatórios</p>
      </div>

      <FinanceiroNav />

      <div>
        <h2 className="text-lg font-medium">Relatórios de Custos Fixos</h2>
        <p className="text-sm text-muted-foreground">
          Filtre por vencimento e exporte em Excel.
        </p>
      </div>

      <FixedCostReportsFilter />
      <FixedCostReportsCharts {...reports} />
    </div>
  )
}
