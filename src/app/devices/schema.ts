import { z } from "zod"

export const deviceMasterSchema = z.object({
  id: z.string(),
  deviceType: z.string(),
  btServe: z.string(),
  btChar: z.string(),
  soundBtName: z.string(),
  status: z.enum(["active", "inactive"]),
})

export const deviceSchema = z.object({
  id: z.string(),
  deviceName: z.string(),
  macAddress: z.string(),
  deviceType: z.string(),
  userId: z.string().nullable(),
  passcode: z.string(),
  status: z.enum(["never_used", "active", "disabled"]),
})

export type Device = z.infer<typeof deviceSchema>
export type DeviceMaster = z.infer<typeof deviceMasterSchema>
