import { PageHeader } from "@/components/layout/page-header"
import { ProductForm } from "@/components/products/product-form"

export default function NovoProdutoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo produto"
        description="Cadastre um item simples ou uma bebida por dose"
        backHref="/produtos"
      />
      <ProductForm />
    </div>
  )
}
