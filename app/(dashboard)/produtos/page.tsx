import Link from "next/link"
import { AlertTriangle, CheckCircle2, Package, Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { ProductTable } from "@/components/products/product-table"
import { DoseSizeManager } from "@/components/products/dose-size-manager"
import { getStockStatus } from "@/lib/stock/getStockStatus"

export default async function ProdutosPage() {
  const [products, doseSizes] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.doseSize.findMany({ orderBy: { volumeMl: "asc" } }),
  ])

  const activeCount = products.filter((p) => p.active).length
  const lowCount = products.filter(
    (p) => p.active && getStockStatus(p.stock, p.minStock) !== "NORMAL"
  ).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Produtos"
        description="Tudo o que você vende: itens simples e bebidas por dose"
        actions={
          <Button render={<Link href="/produtos/novo" />} nativeButton={false} className="h-10 rounded-xl px-4">
            <Plus className="size-4" />
            Novo produto
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard title="Cadastrados" value={String(products.length)} icon={Package} />
        <SummaryCard title="Ativos" value={String(activeCount)} icon={CheckCircle2} />
        <SummaryCard
          title="Estoque baixo ou crítico"
          value={String(lowCount)}
          icon={AlertTriangle}
          hint="Somente produtos ativos"
        />
      </div>

      <ProductTable products={products} />
      <DoseSizeManager doseSizes={doseSizes} />
    </div>
  )
}
