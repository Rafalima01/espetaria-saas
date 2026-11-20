import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { RecipeForm } from "@/components/recipes/recipe-form"

export default async function EditarReceitaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [recipe, products] = await Promise.all([
    prisma.recipe.findUnique({ where: { id }, include: { ingredients: true } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ])
  if (!recipe) notFound()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={recipe.name} description="Editar receita" backHref="/receitas" />
      <RecipeForm recipe={recipe} products={products} />
    </div>
  )
}
