import { z } from "zod"

export const deviceMasterSchema = z.object({
  id: z.string(),
  deviceType: z.string(),
  btServe: z.string(),
  btChar: z.string(),
  soundBtName: z.string(),
  status: z.enum(["active", "inactive"]),
})

// Enhanced device schema with all required columns
export const deviceSchema = z.object({
  id: z.string(),
  deviceName: z.string(),
  macAddress: z.string(),
  deviceType: z.string(),
  userId: z.string().nullable(),
  passcode: z.string(),
  status: z.enum(["never_used", "active", "disabled"]),
  
  // New required columns
  btName: z.string().optional(),
  warrantyStart: z.string().optional(),
  defaultCmd: z.string().optional(),
  firstConnectedAt: z.string().optional(),
})

export type Device = z.infer<typeof deviceSchema>
export type DeviceMaster = z.infer<typeof deviceMasterSchema>
