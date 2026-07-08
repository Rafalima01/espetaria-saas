import type { Prisma } from "@/lib/generated/prisma/client"

export class RecipeNotFoundError extends Error {
  constructor() {
    super("Receita não encontrada")
  }
}

export type RecipeIngredientConsumption = {
  productId: string
  productType: "SIMPLE" | "FRACTIONAL"
  volumeMl: number | null // only meaningful for FRACTIONAL products
}

export type RecipePricing = {
  name: string
  unitPrice: number // cents
  costPriceSnapshot: number // cents
  cupProductId: string | null
  ingredients: RecipeIngredientConsumption[]
}

/** Resolves server-side price/cost + the ingredient list (for stock consumption) for one unit of a recipe sale. */
export async function getRecipePricing(
  tx: Prisma.TransactionClient,
  recipeId: string
): Promise<RecipePricing> {
  const recipe = await tx.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: { include: { product: true } }, cupProduct: true },
  })
  if (!recipe) throw new RecipeNotFoundError()

  let costPriceSnapshot = recipe.ingredients.reduce((sum, ing) => {
    const product = ing.product
    if (product.productType === "FRACTIONAL" && product.volumeMl && ing.volumeMl) {
      return sum + Math.round((product.purchasePrice / product.volumeMl) * ing.volumeMl)
    }
    return sum + product.purchasePrice // SIMPLE ingredient: consumes 1 whole unit
  }, 0)
  if (recipe.cupProduct) costPriceSnapshot += recipe.cupProduct.purchasePrice

  return {
    name: recipe.name,
    unitPrice: recipe.salePrice,
    costPriceSnapshot,
    cupProductId: recipe.cupProductId,
    ingredients: recipe.ingredients.map((ing) => ({
      productId: ing.productId,
      productType: ing.product.productType,
      volumeMl: ing.product.productType === "FRACTIONAL" ? ing.volumeMl : null,
    })),
  }
}
