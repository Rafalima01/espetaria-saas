import { prisma } from "@/lib/prisma"
import { SalesTable } from "@/components/sales/sales-table"

export default async function VendasPage() {
  const sales = await prisma.sale.findMany({
    include: { user: { select: { name: true } }, payments: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Vendas</h1>
      <SalesTable sales={sales} />
    </div>
  )
}
