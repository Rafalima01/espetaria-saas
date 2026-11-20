import Link from "next/link"
import { GlassWater, Pencil, Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { StatusPill } from "@/components/ui/status-pill"
import { centsToBRL } from "@/lib/money"
import { cn } from "@/lib/utils"

export default async function ReceitasPage() {
  const recipes = await prisma.recipe.findMany({
    include: { ingredients: { include: { product: { select: { name: true, productType: true } } } }, cupProduct: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Receitas"
        description={`${recipes.length} receita(s) cadastrada(s). Vender uma receita baixa os ingredientes e o copo do estoque.`}
        actions={
          <Button className="h-10 rounded-xl px-4" render={<Link href="/receitas/novo" />} nativeButton={false}>
            <Plus className="size-4" />
            Nova receita
          </Button>
        }
      />

      {recipes.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Nenhuma receita cadastrada.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className={cn("gap-4 p-5", !recipe.active && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <GlassWater className="size-5" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{recipe.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {recipe.cupProduct ? `Copo: ${recipe.cupProduct.name}` : "Sem copo definido"}
                    </span>
                  </div>
                </div>
                <StatusPill tone={recipe.active ? "success" : "neutral"}>
                  {recipe.active ? "Ativa" : "Inativa"}
                </StatusPill>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Sem ingredientes</span>
                ) : (
                  recipe.ingredients.map((ing) => (
                    <span
                      key={ing.id}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                    >
                      {ing.product.name}
                      {ing.product.productType === "FRACTIONAL" && ing.volumeMl ? ` · ${ing.volumeMl}ml` : ""}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-auto flex items-end justify-between">
                <span className="text-2xl font-semibold tracking-tight text-primary tabular-nums">
                  {centsToBRL(recipe.salePrice)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg"
                  render={<Link href={`/receitas/${recipe.id}`} />}
                  nativeButton={false}
                >
                  <Pencil className="size-3.5" />
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
