import { z } from "zod"

const MONTH_FAMILY_RECURRENCES = ["MONTHLY", "BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"]

// Plain object schema (no superRefine) so PATCH can still call `.partial()` —
// ZodEffects (the type superRefine produces) doesn't support `.partial()`.
export const fixedCostBaseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  category: z.string().min(1, "Categoria é obrigatória"),
  amount: z.number().int().min(1, "Informe um valor"),
  dueDay: z.number().int().min(1).max(31).optional(),
  recurrence: z
    .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"])
    .default("MONTHLY"),
  paymentMethod: z
    .enum(["PIX", "CASH", "CREDIT", "DEBIT", "VOUCHER"])
    .optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
  active: z.boolean().default(true),
})

export const fixedCostSchema = fixedCostBaseSchema.superRefine((data, ctx) => {
  if (MONTH_FAMILY_RECURRENCES.includes(data.recurrence) && !data.dueDay) {
    ctx.addIssue({
      code: "custom",
      message: "Informe o dia de vencimento para esta recorrência",
      path: ["dueDay"],
    })
  }
})

export type FixedCostInput = z.infer<typeof fixedCostSchema>
