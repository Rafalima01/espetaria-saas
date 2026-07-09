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
} from "lucide-react"
import { getDashboardSummary } from "@/lib/dashboard/getSummary"
import {
  getSalesByHour,
  getSalesByDay,
  getTopProducts,
  getPaymentMethodBreakdown,
} from "@/lib/dashboard/getCharts"
import { getLowStockAlerts } from "@/lib/stock/getLowStockAlerts"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { SalesByHourChart } from "@/components/dashboard/sales-by-hour-chart"
import { SalesByDayChart } from "@/components/dashboard/sales-by-day-chart"
import { TopProductsChart } from "@/components/dashboard/top-products-chart"
import { PaymentMethodsChart } from "@/components/dashboard/payment-methods-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockStatusBadge } from "@/components/stock/stock-status-badge"
import { centsToBRL } from "@/lib/money"

export default async function DashboardPage() {
  const [summary, salesByHour, salesByDay, topProducts, paymentBreakdown, lowStockAlerts] =
    await Promise.all([
      getDashboardSummary(),
      getSalesByHour(),
      getSalesByDay(),
      getTopProducts(),
      getPaymentMethodBreakdown(),
      getLowStockAlerts(),
    ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do negócio hoje</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
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
          title="Lucro (hoje)"
          value={centsToBRL(summary.profitToday)}
          icon={Wallet}
        />
        <SummaryCard
          title="Vendas hoje"
          value={String(summary.salesCountToday)}
          icon={ShoppingCart}
        />
        <SummaryCard
          title="Ticket médio (hoje)"
          value={centsToBRL(summary.averageTicketToday)}
          icon={Receipt}
        />
        <SummaryCard
          title="Caixa (dinheiro hoje)"
          value={centsToBRL(summary.cashInDrawerToday)}
          icon={Wallet}
          hint="Soma de pagamentos em dinheiro"
        />
        <SummaryCard
          title="Clientes atendidos hoje"
          value={String(summary.customersServedToday)}
          icon={Users}
          hint="Vendas concluídas hoje"
        />
        <SummaryCard
          title="Produtos com estoque baixo"
          value={String(lowStockAlerts.length)}
          icon={AlertTriangle}
          hint="Baixo + crítico"
        />
      </div>

      <div>
        <h2 className="text-lg font-medium">Resultado financeiro do mês</h2>
        <p className="text-sm text-muted-foreground">Lucro bruto menos custos fixos do mês</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          title="Custos Fixos do Mês"
          value={centsToBRL(summary.fixedCostsMonth)}
          icon={Landmark}
        />
        <SummaryCard
          title="Valor Pago"
          value={centsToBRL(summary.fixedCostsPaidMonth)}
          icon={CheckCircle2}
        />
        <SummaryCard
          title="Valor Pendente"
          value={centsToBRL(summary.fixedCostsPendingMonth)}
          icon={Wallet}
        />
        <SummaryCard
          title="Lucro Líquido"
          value={centsToBRL(summary.netProfitMonth)}
          icon={TrendingUp}
          hint="Lucro do mês − Custos Fixos do Mês"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SalesByHourChart data={salesByHour} />
        <SalesByDayChart data={salesByDay} />
        <TopProductsChart data={topProducts} />
        <PaymentMethodsChart data={paymentBreakdown} />
      </div>

      {lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas de estoque</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {lowStockAlerts.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/estoque/${p.id}`}
                className="flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-muted"
              >
                <span>{p.name}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  {p.stock} / mín. {p.minStock}
                  <StockStatusBadge stock={p.stock} minStock={p.minStock} />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
