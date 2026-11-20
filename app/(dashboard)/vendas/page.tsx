import { Ban, DollarSign, Receipt, ShoppingCart } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { SalesTable } from "@/components/sales/sales-table"
import { centsToBRL } from "@/lib/money"

export default async function VendasPage() {
  const sales = await prisma.sale.findMany({
    include: { user: { select: { name: true } }, payments: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const completed = sales.filter((s) => s.status === "COMPLETED")
  const cancelledCount = sales.filter((s) => s.status === "CANCELLED").length
  const revenue = completed.reduce((sum, s) => sum + s.total, 0)
  const averageTicket = completed.length > 0 ? Math.round(revenue / completed.length) : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vendas"
        description="As 100 vendas mais recentes. Os totais abaixo consideram só essas."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard highlight title="Faturamento" value={centsToBRL(revenue)} icon={DollarSign} />
        <SummaryCard title="Vendas concluídas" value={String(completed.length)} icon={ShoppingCart} />
        <SummaryCard title="Ticket médio" value={centsToBRL(averageTicket)} icon={Receipt} />
        <SummaryCard title="Canceladas" value={String(cancelledCount)} icon={Ban} />
      </div>

      <SalesTable sales={sales} />
    </div>
  )
}
