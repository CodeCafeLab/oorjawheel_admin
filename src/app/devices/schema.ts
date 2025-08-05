import { z } from "zod"

export const deviceSchema = z.object({
  id: z.string(),
  btName: z.string(),
  macAddress: z.string(),
  warrantyStart: z.string(),
  defaultCommand: z.string(),
  firstConnected: z.string().nullable(),
  status: z.enum(["never_used", "active", "disabled"]),
})

export type Device = z.infer<typeof deviceSchema>
