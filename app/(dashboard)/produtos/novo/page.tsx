import { ProductForm } from "@/components/products/product-form"

export default function NovoProdutoPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Novo produto</h1>
      <ProductForm />
    </div>
  )
}
