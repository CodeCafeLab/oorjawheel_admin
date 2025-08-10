import { z } from "zod"

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  status: z.enum(["active", "locked"]),
  firstLoginAt: z.string().nullable(),
  devicesAssigned: z.array(z.string()),
})

export type User = z.infer<typeof userSchema>
