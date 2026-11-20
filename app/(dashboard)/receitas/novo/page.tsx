import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { RecipeForm } from "@/components/recipes/recipe-form"

export default async function NovaReceitaPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova receita"
        description="Monte uma bebida pronta, como um copão ou uma caipirinha"
        backHref="/receitas"
      />
      <RecipeForm products={products} />
    </div>
  )
}
