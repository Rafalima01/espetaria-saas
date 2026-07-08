import { prisma } from "@/lib/prisma"
import { StockMovementTable } from "@/components/stock/stock-movement-table"

export default async function MovimentacoesPage() {
  const movements = await prisma.stockMovement.findMany({
    include: { product: { select: { name: true } }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Movimentações de estoque</h1>
      <StockMovementTable movements={movements} />
    </div>
  )
}
