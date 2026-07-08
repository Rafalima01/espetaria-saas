import { z } from "zod"

export const creditCustomerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  phone: z.string().min(1, "Telefone é obrigatório").max(30),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  cpf: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  creditLimit: z.number().int().min(0),
  status: z.enum(["ACTIVE", "BLOCKED"]).default("ACTIVE"),
})

export type CreditCustomerInput = z.infer<typeof creditCustomerSchema>

export const financialPaymentInputSchema = z.object({
  amount: z.number().int().min(1),
  method: z.enum(["PIX", "CASH", "CREDIT", "DEBIT", "VOUCHER"]).optional(),
  note: z.string().max(300).optional().or(z.literal("")),
})
