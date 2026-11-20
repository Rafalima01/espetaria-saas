import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { ProductForm } from "@/components/products/product-form"
import { DosePriceEditor } from "@/components/products/dose-price-editor"

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, doseSizes] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { dosePrices: true } }),
    prisma.doseSize.findMany({ where: { active: true }, orderBy: { volumeMl: "asc" } }),
  ])
  if (!product) notFound()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={product.name} description="Editar produto" backHref="/produtos" />
      <ProductForm product={product} />
      {product.productType === "FRACTIONAL" && (
        <DosePriceEditor
          productId={product.id}
          doseSizes={doseSizes}
          existingPrices={product.dosePrices}
        />
      )}
    </div>
  )
}
