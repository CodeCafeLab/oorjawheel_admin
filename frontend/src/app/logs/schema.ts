import { z } from "zod"

export const commandLogSchema = z.object({
  id: z.string(),
  device: z.string(),
  user: z.string(),
  command: z.string(),
  sentAt: z.string(),
  result: z.string(),
})

export const deviceEventSchema = z.object({
    id: z.string(),
    device: z.string(),
    event: z.enum(["connect", "disconnect", "scan_fail"]),
    timestamp: z.string(),
})

export type CommandLog = z.infer<typeof commandLogSchema>
export type DeviceEvent = z.infer<typeof deviceEventSchema>
