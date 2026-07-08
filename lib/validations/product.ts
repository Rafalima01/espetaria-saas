import { z } from "zod"

// Plain object schema (no superRefine) so PATCH can still call `.partial()` —
// ZodEffects (the type superRefine produces) doesn't support `.partial()`.
export const productBaseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  category: z.string().min(1, "Categoria é obrigatória"),
  productType: z.enum(["SIMPLE", "FRACTIONAL"]).default("SIMPLE"),
  volumeMl: z.number().int().min(1).optional(),
  fullBottleSalePrice: z.number().int().min(0).optional(),
  purchasePrice: z.number().int().min(0),
  salePrice: z.number().int().min(0),
  code: z.string().max(40).optional().or(z.literal("")),
  barcode: z.string().max(40).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  stock: z.number().int().min(0),
  minStock: z.number().int().min(0),
  supplier: z.string().max(120).optional().or(z.literal("")),
  active: z.boolean().default(true),
})

export const productSchema = productBaseSchema.superRefine((data, ctx) => {
  if (data.productType === "FRACTIONAL" && !data.volumeMl) {
    ctx.addIssue({
      code: "custom",
      message: "Informe o volume (ml) para um produto do tipo Bebida Fracionada",
      path: ["volumeMl"],
    })
  }
})

export type ProductInput = z.infer<typeof productSchema>
