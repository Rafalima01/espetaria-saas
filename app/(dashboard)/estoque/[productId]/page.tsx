import { notFound } from "next/navigation"
import { Boxes, Droplets, GlassWater, Percent, TrendingDown, Wine } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { Card } from "@/components/ui/card"
import { StockStatusBadge } from "@/components/stock/stock-status-badge"
import { StockMovementTable } from "@/components/stock/stock-movement-table"
import { ProductRestockButton } from "@/components/stock/product-restock-button"
import { computeFractionalStockSummary } from "@/lib/bottles/getFractionalStockSummary"

export default async function ProductStockHistoryPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const [session, product, movements] = await Promise.all([
    auth(),
    prisma.product.findUnique({
      where: { id: productId },
      include: { instances: { where: { status: "OPEN" } } },
    }),
    prisma.stockMovement.findMany({
      where: { productId },
      include: { product: { select: { name: true } }, user: { select: { name: true } }, sale: true },
      orderBy: { createdAt: "desc" },
    }),
  ])
  if (!product) notFound()

  const fractional =
    product.productType === "FRACTIONAL"
      ? computeFractionalStockSummary(product, product.instances)
      : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={product.name}
        description={product.category}
        backHref="/estoque"
        actions={
          <ProductRestockButton
            product={{ id: product.id, name: product.name, stock: product.stock }}
            responsibleName={session?.user?.name ?? "Usuário"}
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard title="Estoque atual" value={String(product.stock)} icon={Boxes} />
        <SummaryCard title="Estoque mínimo" value={String(product.minStock)} icon={TrendingDown} />
        <Card className="gap-3 p-5">
          <span className="text-sm text-muted-foreground">Status</span>
          <div>
            <StockStatusBadge
              stock={product.stock}
              minStock={product.minStock}
              className="h-7 px-3 text-sm"
            />
          </div>
        </Card>
      </div>

      {fractional && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard title="Garrafas físicas" value={String(fractional.physicalBottles)} icon={Wine} />
          <SummaryCard
            title="Volume total restante"
            value={`${fractional.totalVolumeMl}ml`}
            icon={Droplets}
          />
          <SummaryCard
            title="% restante"
            value={`${fractional.percentRemaining.toFixed(0)}%`}
            icon={Percent}
          />
          <SummaryCard
            title="Doses restantes"
            value={String(fractional.dosesRemaining ?? "—")}
            icon={GlassWater}
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Histórico de movimentações</h2>
        <StockMovementTable movements={movements} />
      </div>
    </div>
  )
}
