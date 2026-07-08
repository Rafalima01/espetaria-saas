import Link from "next/link"
import { GlassWater, Wine, TrendingUp, Percent, AlertTriangle } from "lucide-react"
import { getBottleDashboardSummary } from "@/lib/dashboard/getBottleSummary"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { Button } from "@/components/ui/button"
import { centsToBRL } from "@/lib/money"

export default async function DosesDashboardPage() {
  const summary = await getBottleDashboardSummary()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard de Doses</h1>
          <p className="text-muted-foreground">Últimos 30 dias</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/produtos" />} nativeButton={false}>
            Produtos
          </Button>
          <Button variant="outline" render={<Link href="/receitas" />} nativeButton={false}>
            Receitas
          </Button>
          <Button render={<Link href="/doses/simulador" />} nativeButton={false}>
            Simulador de lucro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          title="Doses vendidas"
          value={String(summary.dosesVendidas)}
          icon={GlassWater}
        />
        <SummaryCard
          title="Garrafas abertas"
          value={String(summary.garrafasAbertas)}
          icon={Wine}
        />
        <SummaryCard
          title="Garrafas finalizadas"
          value={String(summary.garrafasFinalizadas)}
          icon={Wine}
        />
        <SummaryCard
          title="Lucro total (doses)"
          value={centsToBRL(summary.totalProfit)}
          icon={TrendingUp}
        />
        <SummaryCard
          title="Produto mais lucrativo"
          value={summary.mostProfitableBottle}
          icon={TrendingUp}
        />
        <SummaryCard
          title="Dose mais vendida"
          value={summary.bestSellingDose}
          icon={GlassWater}
        />
        <SummaryCard
          title="Rendimento médio por garrafa"
          value={`${summary.averageYieldPerBottle} doses`}
          icon={Percent}
          hint="Média de doses servidas por garrafa finalizada"
        />
        <SummaryCard
          title="Perdas por desperdício"
          value={`${summary.wasteVolumeMl}ml / ${summary.wasteUnits} un.`}
          icon={AlertTriangle}
        />
      </div>
    </div>
  )
}
