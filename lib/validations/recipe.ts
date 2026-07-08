import { z } from "zod"

export const recipeIngredientSchema = z.object({
  productId: z.string().min(1),
  // Only meaningful for FRACTIONAL products (ml consumed); SIMPLE ingredients
  // (e.g. Gelo) always consume 1 whole unit and don't need a volume.
  volumeMl: z.number().int().min(1).optional(),
})

export const recipeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  cupProductId: z.string().min(1).optional(),
  salePrice: z.number().int().min(0),
  description: z.string().max(1000).optional().or(z.literal("")),
  active: z.boolean().default(true),
  ingredients: z.array(recipeIngredientSchema).min(1, "Adicione ao menos um ingrediente"),
})

export type RecipeInput = z.infer<typeof recipeSchema>
