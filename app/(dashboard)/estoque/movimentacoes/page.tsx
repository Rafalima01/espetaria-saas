import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { StockMovementTable } from "@/components/stock/stock-movement-table"

export default async function MovimentacoesPage() {
  const movements = await prisma.stockMovement.findMany({
    include: { product: { select: { name: true } }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Movimentações de estoque"
        description="As 200 movimentações mais recentes, de todos os produtos"
        backHref="/estoque"
      />
      <StockMovementTable movements={movements} />
    </div>
  )
}
