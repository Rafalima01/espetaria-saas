import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Estoque</h1>
          <p className="text-muted-foreground">
            Visualização e gerenciamento do estoque atual — o cadastro fica em Produtos.
          </p>
        </div>
        <Button
          variant="outline"
          render={<Link href="/estoque/nova-movimentacao" />}
          nativeButton={false}
        >
          Registrar perda/quebra/ajuste
        </Button>
      </div>

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
