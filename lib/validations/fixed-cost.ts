import { z } from "zod"

export const fixedCostBaseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  category: z.string().min(1, "Categoria é obrigatória"),
  monthlyAmount: z.number().int().min(1, "Informe um valor mensal"),
  dueDay: z.number().int().min(1).max(31),
  paymentMethod: z
    .enum(["PIX", "CASH", "CREDIT", "DEBIT", "VOUCHER"])
    .optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
  active: z.boolean().default(true),
})

export type FixedCostInput = z.infer<typeof fixedCostBaseSchema>
