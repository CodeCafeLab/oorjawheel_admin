import { z } from "zod"

export const orderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  date: z.string(),
  total: z.number(),
  status: z.enum(["processing", "shipped", "completed", "cancelled"]),
})

export type Order = z.infer<typeof orderSchema>
