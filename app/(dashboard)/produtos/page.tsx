import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ProductTable } from "@/components/products/product-table"
import { DoseSizeManager } from "@/components/products/dose-size-manager"

export default async function ProdutosPage() {
  const [products, doseSizes] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.doseSize.findMany({ orderBy: { volumeMl: "asc" } }),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-muted-foreground">
            {products.length} produto(s) cadastrado(s)
          </p>
        </div>
        <Button render={<Link href="/produtos/novo" />} nativeButton={false}>
          Novo produto
        </Button>
      </div>
      <DoseSizeManager doseSizes={doseSizes} />
      <ProductTable products={products} />
    </div>
  )
}
