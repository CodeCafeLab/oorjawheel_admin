import { z } from "zod"

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  totalSpent: z.number(),
  orders: z.number(),
  status: z.enum(["active", "inactive"]),
})

export type Customer = z.infer<typeof customerSchema>
