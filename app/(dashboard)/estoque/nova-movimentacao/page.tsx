import { prisma } from "@/lib/prisma"
import { StockMovementForm } from "@/components/stock/stock-movement-form"

export default async function NovaMovimentacaoPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Registrar perda, quebra ou ajuste</h1>
      <p className="text-muted-foreground">
        Para entradas de estoque, use o botão Reabastecer na tela de Estoque.
      </p>
      <StockMovementForm products={products} />
    </div>
  )
}
