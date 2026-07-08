import { z } from "zod"

export const saleItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  discount: z.number().int().min(0).default(0),
  surcharge: z.number().int().min(0).default(0),
  note: z.string().max(300).optional().or(z.literal("")),
})

export const doseItemInputSchema = z.object({
  productId: z.string().min(1),
  doseSizeId: z.string().min(1).optional(),
  mode: z.enum(["DOSE", "HALF_BOTTLE", "FULL_BOTTLE"]),
  quantity: z.number().int().min(1),
  discount: z.number().int().min(0).default(0),
  note: z.string().max(300).optional().or(z.literal("")),
})

export const recipeItemInputSchema = z.object({
  recipeId: z.string().min(1),
  quantity: z.number().int().min(1),
  discount: z.number().int().min(0).default(0),
  note: z.string().max(300).optional().or(z.literal("")),
})

export const paymentInputSchema = z.object({
  method: z.enum(["PIX", "CASH", "CREDIT", "DEBIT", "VOUCHER", "FIADO"]),
  amount: z.number().int().min(1),
})

export const createSaleSchema = z
  .object({
    items: z.array(saleItemInputSchema).default([]),
    doseItems: z.array(doseItemInputSchema).default([]),
    recipeItems: z.array(recipeItemInputSchema).default([]),
    discount: z.number().int().min(0).default(0),
    surcharge: z.number().int().min(0).default(0),
    payments: z.array(paymentInputSchema).min(1),
    creditCustomerId: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.items.length + data.doseItems.length + data.recipeItems.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "A venda precisa ter ao menos um item",
        path: ["items"],
      })
    }
    const hasFiado = data.payments.some((p) => p.method === "FIADO")
    if (hasFiado && !data.creditCustomerId) {
      ctx.addIssue({
        code: "custom",
        message: "Selecione um cliente para pagamento fiado",
        path: ["creditCustomerId"],
      })
    }
    if (data.payments.filter((p) => p.method === "FIADO").length > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Apenas uma forma de pagamento fiado por venda",
        path: ["payments"],
      })
    }
  })

export type CreateSaleInput = z.infer<typeof createSaleSchema>
