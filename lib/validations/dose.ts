import { z } from "zod"

export const doseSizeSchema = z.object({
  volumeMl: z.number().int().min(1),
  active: z.boolean().default(true),
})

export const dosePricesSchema = z.object({
  prices: z.array(
    z.object({
      doseSizeId: z.string().min(1),
      salePrice: z.number().int().min(0),
    })
  ),
})
