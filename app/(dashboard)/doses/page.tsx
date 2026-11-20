import Link from "next/link"
import {
  GlassWater,
  Wine,
  TrendingUp,
  Percent,
  AlertTriangle,
  Droplets,
  Calculator,
  Crown,
  Package,
  Martini,
} from "lucide-react"
import { getBottleDashboardSummary } from "@/lib/dashboard/getBottleSummary"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { SectionTitle } from "@/components/layout/section-title"
import { centsToBRL } from "@/lib/money"

export default async function DosesDashboardPage() {
  const summary = await getBottleDashboardSummary()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Doses"
        description="Desempenho das bebidas vendidas por dose, nos últimos 30 dias"
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 rounded-xl px-4"
              render={<Link href="/produtos" />}
              nativeButton={false}
            >
              <Package className="size-4" />
              Produtos
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl px-4"
              render={<Link href="/receitas" />}
              nativeButton={false}
            >
              <Martini className="size-4" />
              Receitas
            </Button>
            <Button
              className="h-10 rounded-xl px-4"
              render={<Link href="/doses/simulador" />}
              nativeButton={false}
            >
              <Calculator className="size-4" />
              Simulador de lucro
            </Button>
          </>
        }
      />

      <SectionTitle title="Vendas" description="O que saiu e quanto rendeu" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          highlight
          title="Lucro total (doses)"
          value={centsToBRL(summary.totalProfit)}
          icon={TrendingUp}
        />
        <SummaryCard
          title="Doses vendidas"
          value={String(summary.dosesVendidas)}
          icon={GlassWater}
        />
        <SummaryCard
          title="Ml vendidos"
          value={`${summary.mlVendidos}ml`}
          icon={Droplets}
        />
        <SummaryCard
          title="Garrafas vendidas (inteiras)"
          value={String(summary.garrafasVendidas)}
          icon={Wine}
        />
      </div>

      <SectionTitle title="Destaques" description="O que mais performa" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Produto mais lucrativo"
          value={summary.mostProfitableBottle}
          icon={Crown}
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
      </div>

      <SectionTitle title="Garrafas e estoque" description="Situação do que está aberto e guardado" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          title="Volume restante em estoque"
          value={`${summary.volumeRestanteTotal}ml`}
          icon={Droplets}
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
