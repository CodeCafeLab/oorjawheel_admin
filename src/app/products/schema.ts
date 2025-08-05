import { z } from "zod"

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
  status: z.enum(["in stock", "out of stock", "low stock"]),
  image: z.string().url(),
})

export type Product = z.infer<typeof productSchema>
