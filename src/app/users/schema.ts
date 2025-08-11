import { z } from "zod"

export const userSchema = z.object({
  id: z.string().or(z.number()),
  fullName: z.string().nullable().default(''),
  email: z.string().email(),
  contactNumber: z.string().nullable().default(''),
  address: z.string().nullable().default(''),
  country: z.string().nullable().default(''),
  status: z.enum(["active", "locked"]),
  firstLoginAt: z.string().nullable(),
  devicesAssigned: z.array(z.string()),
})

export type User = z.infer<typeof userSchema>
