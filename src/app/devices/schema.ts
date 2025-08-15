
import { z } from "zod"

export const deviceMasterSchema = z.object({
  id: z.string().or(z.number()),
  deviceType: z.string(),
  btServe: z.string(),
  btChar: z.string(),
  soundBtName: z.string(),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
})

// Enhanced device schema with all required columns from DB
export const deviceSchema = z.object({
  id: z.string().or(z.number()),
  deviceName: z.string().nullable(),
  macAddress: z.string().nullable(),
  deviceType: z.string().nullable(),
  userId: z.string().nullable(),
  passcode: z.string().nullable(),
  status: z.enum(["never_used", "active", "disabled"]),
  btName: z.string().optional().nullable(),
  warrantyStart: z.string().optional().nullable(),
  defaultCmd: z.string().optional().nullable(),
  firstConnectedAt: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
})

export type Device = z.infer<typeof deviceSchema>
export type DeviceMaster = z.infer<typeof deviceMasterSchema>

