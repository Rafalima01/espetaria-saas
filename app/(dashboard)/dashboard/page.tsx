import Link from "next/link"
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Receipt,
  Users,
  AlertTriangle,
  CheckCircle2,
  Landmark,
  Droplets,
  GlassWater,
  Percent,
} from "lucide-react"
import { getDashboardSummary } from "@/lib/dashboard/getSummary"
import {
  getSalesByHour,
  getSalesByDay,
  getTopProducts,
  getPaymentMethodBreakdown,
} from "@/lib/dashboard/getCharts"
import { getRecentSales } from "@/lib/dashboard/getRecentSales"
import { getLowStockAlerts } from "@/lib/stock/getLowStockAlerts"
import { getFractionalStockDashboardSummary } from "@/lib/bottles/getFractionalStockSummary"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { SalesByHourChart } from "@/components/dashboard/sales-by-hour-chart"
import { SalesByDayChart } from "@/components/dashboard/sales-by-day-chart"
import { TopProductsChart } from "@/components/dashboard/top-products-chart"
import { PaymentMethodsChart } from "@/components/dashboard/payment-methods-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StockStatusBadge } from "@/components/stock/stock-status-badge"
import { centsToBRL } from "@/lib/money"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"

const TIME_ZONE = "America/Sao_Paulo"

function formatSaleTime(date: Date) {
  return date.toLocaleString("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const [
    summary,
    salesByHour,
    salesByDay,
    topProducts,
    paymentBreakdown,
    lowStockAlerts,
    fractionalStock,
    recentSales,
  ] = await Promise.all([
    getDashboardSummary(),
    getSalesByHour(),
    getSalesByDay(),
    getTopProducts(),
    getPaymentMethodBreakdown(),
    getLowStockAlerts(),
    getFractionalStockDashboardSummary(),
    getRecentSales(),
  ])

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
          <p className="text-muted-foreground">Como o bar está indo hoje</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            highlight
            title="Faturamento hoje"
            value={centsToBRL(summary.revenueToday)}
            icon={DollarSign}
          />
          <SummaryCard
            title="Faturamento do mês"
            value={centsToBRL(summary.revenueMonth)}
            icon={TrendingUp}
          />
          <SummaryCard
            title="Lucro hoje"
            value={centsToBRL(summary.profitToday)}
            icon={Wallet}
          />
          <SummaryCard
            title="Vendas hoje"
            value={String(summary.salesCountToday)}
            icon={ShoppingCart}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <SalesByDayChart data={salesByDay} />
          <PaymentMethodsChart data={paymentBreakdown} />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            title="Ticket médio hoje"
            value={centsToBRL(summary.averageTicketToday)}
            icon={Receipt}
          />
          <SummaryCard
            title="Caixa em dinheiro"
            value={centsToBRL(summary.cashInDrawerToday)}
            icon={Wallet}
            hint="Pagamentos em dinheiro hoje"
          />
          <SummaryCard
            title="Clientes atendidos"
            value={String(summary.customersServedToday)}
            icon={Users}
            hint="Vendas concluídas hoje"
          />
          <SummaryCard
            title="Estoque baixo"
            value={String(lowStockAlerts.length)}
            icon={AlertTriangle}
            hint="Produtos em baixo ou crítico"
          />
        </div>

        <SectionTitle
          title="Resultado financeiro do mês"
          description="Lucro bruto menos custos fixos do mês"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            title="Custos fixos do mês"
            value={centsToBRL(summary.fixedCostsMonth)}
            icon={Landmark}
          />
          <SummaryCard
            title="Valor pago"
            value={centsToBRL(summary.fixedCostsPaidMonth)}
            icon={CheckCircle2}
          />
          <SummaryCard
            title="Valor pendente"
            value={centsToBRL(summary.fixedCostsPendingMonth)}
            icon={Wallet}
          />
          <SummaryCard
            highlight
            title="Lucro líquido"
            value={centsToBRL(summary.netProfitMonth)}
            icon={TrendingUp}
            hint="Lucro do mês − custos fixos"
          />
        </div>

        <SectionTitle
          title="Estoque de doseáveis"
          description="Bebidas fracionadas, últimos 30 dias"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            title="Volume disponível"
            value={`${fractionalStock.volumeDisponivel}ml`}
            icon={Droplets}
          />
          <SummaryCard
            title="Volume consumido"
            value={`${fractionalStock.volumeConsumido}ml`}
            icon={GlassWater}
            hint="Últimos 30 dias"
          />
          <SummaryCard
            title="Doses restantes"
            value={String(fractionalStock.dosesRestantesTotal)}
            icon={GlassWater}
          />
          <SummaryCard
            title="% consumido"
            value={`${fractionalStock.percentualConsumido.toFixed(0)}%`}
            icon={Percent}
            hint="Últimos 30 dias"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SalesByHourChart data={salesByHour} />
          <TopProductsChart data={topProducts} />
        </div>
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimas vendas</CardTitle>
            <CardDescription>Vendas concluídas mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nenhuma venda ainda.</p>
            ) : (
              <ul className="flex flex-col">
                {recentSales.map((sale) => {
                  const methods = Array.from(new Set(sale.payments.map((p) => p.method)))
                    .map((m) => PAYMENT_METHOD_LABELS[m] ?? m)
                    .join(", ")
                  return (
                    <li key={sale.id}>
                      <Link
                        href={`/vendas/${sale.id}`}
                        className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted"
                      >
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium">
                            {methods || "Venda"}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {formatSaleTime(sale.createdAt)} · {sale.user.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary tabular-nums">
                          {centsToBRL(sale.total)}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alertas de estoque</CardTitle>
            <CardDescription>
              {lowStockAlerts.length === 0
                ? "Tudo em ordem"
                : `${lowStockAlerts.length} produto(s) precisam de atenção`}
            </CardDescription>
          </CardHeader>
          {lowStockAlerts.length > 0 && (
            <CardContent>
              <ul className="flex flex-col">
                {lowStockAlerts.slice(0, 8).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/estoque/${p.id}`}
                      className="-mx-2 flex items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <span className="min-w-0 truncate">{p.name}</span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                        {p.stock}/{p.minStock}
                        <StockStatusBadge stock={p.stock} minStock={p.minStock} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      </aside>
    </div>
  )
}
