import { z } from "zod"

export const ROLES = ["ADMIN", "MANAGER", "CASHIER", "WAITER"] as const

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  email: z
    .string()
    .email("Email inválido")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
  role: z.enum(ROLES),
  active: z.boolean().default(true),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
})
