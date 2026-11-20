import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { StockMovementForm } from "@/components/stock/stock-movement-form"

export default async function NovaMovimentacaoPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Registrar perda, quebra ou ajuste"
        description="Para entradas de estoque, use o botão Reabastecer na tela de Estoque."
        backHref="/estoque"
      />
      <StockMovementForm products={products} />
    </div>
  )
}
