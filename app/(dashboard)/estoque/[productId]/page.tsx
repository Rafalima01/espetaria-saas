import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockStatusBadge } from "@/components/stock/stock-status-badge"
import { StockMovementTable } from "@/components/stock/stock-movement-table"
import { ProductRestockButton } from "@/components/stock/product-restock-button"

export default async function ProductStockHistoryPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const [session, product, movements] = await Promise.all([
    auth(),
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.stockMovement.findMany({
      where: { productId },
      include: { product: { select: { name: true } }, user: { select: { name: true } }, sale: true },
      orderBy: { createdAt: "desc" },
    }),
  ])
  if (!product) notFound()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-muted-foreground">{product.category}</p>
        </div>
        <ProductRestockButton
          product={{ id: product.id, name: product.name, stock: product.stock }}
          responsibleName={session?.user?.name ?? "Usuário"}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque atual
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{product.stock}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque mínimo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{product.minStock}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StockStatusBadge stock={product.stock} minStock={product.minStock} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Histórico de movimentações</h2>
        <StockMovementTable movements={movements} />
      </div>
    </div>
  )
}
