import { prisma } from "@/lib/prisma"
import { RecipeForm } from "@/components/recipes/recipe-form"

export default async function NovaReceitaPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Nova receita</h1>
      <RecipeForm products={products} />
    </div>
  )
}
