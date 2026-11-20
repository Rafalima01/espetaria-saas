import Link from "next/link"
import { ClipboardList } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { getStockStatus } from "@/lib/stock/getStockStatus"
import { InventoryTable } from "@/components/stock/inventory-table"
import { StockStatusSummary } from "@/components/stock/stock-status-summary"
import { computeFractionalStockSummary } from "@/lib/bottles/getFractionalStockSummary"

export default async function EstoquePage() {
  const [session, products] = await Promise.all([
    auth(),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { instances: { where: { status: "OPEN" } } },
    }),
  ])

  const fractionalSummaries = Object.fromEntries(
    products
      .filter((p) => p.productType === "FRACTIONAL")
      .map((p) => [p.id, computeFractionalStockSummary(p, p.instances)])
  )

  const lastMovements = await Promise.all(
    products.map((p) =>
      prisma.stockMovement.findFirst({
        where: { productId: p.id },
        orderBy: { createdAt: "desc" },
      })
    )
  )
  const lastMovementByProduct = new Map(products.map((p, i) => [p.id, lastMovements[i]]))

  const counts = { NORMAL: 0, LOW: 0, CRITICAL: 0 }
  for (const p of products) {
    if (!p.active) continue
    counts[getStockStatus(p.stock, p.minStock)]++
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Estoque"
        description="Situação atual de cada produto. O cadastro fica em Produtos."
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 rounded-xl px-4"
              render={<Link href="/estoque/movimentacoes" />}
              nativeButton={false}
            >
              <ClipboardList className="size-4" />
              Movimentações
            </Button>
            <Button
              className="h-10 rounded-xl px-4"
              render={<Link href="/estoque/nova-movimentacao" />}
              nativeButton={false}
            >
              Registrar perda, quebra ou ajuste
            </Button>
          </>
        }
      />

      <StockStatusSummary counts={counts} />

      <InventoryTable
        products={products}
        lastMovementByProduct={Object.fromEntries(lastMovementByProduct)}
        responsibleName={session?.user?.name ?? "Usuário"}
        fractionalSummaries={fractionalSummaries}
      />
    </div>
  )
}
