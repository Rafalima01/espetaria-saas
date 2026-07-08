import { z } from "zod"

export const stockMovementSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["IN", "OUT", "LOSS", "BREAKAGE", "ADJUSTMENT"]),
  quantity: z.number().int().min(0),
  reason: z.string().max(500).optional().or(z.literal("")),
})

export type StockMovementInput = z.infer<typeof stockMovementSchema>

export const restockSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  date: z.string().optional(), // ISO date; defaults to now on the server
  note: z.string().max(500).optional().or(z.literal("")),
})

export type RestockInput = z.infer<typeof restockSchema>
