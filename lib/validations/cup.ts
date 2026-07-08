import { z } from "zod"

export const cupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(80),
  capacityMl: z.number().int().min(1),
  type: z.string().max(60).optional().or(z.literal("")),
  active: z.boolean().default(true),
})

export type CupInput = z.infer<typeof cupSchema>
