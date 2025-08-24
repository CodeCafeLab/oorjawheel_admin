import { z } from "zod";

export const manualCommandDetailsSchema = z.object({
  type: z.enum(["wheel", "sound", "light"]),
  command: z.string(),
});

export const autoCommandDetailsSchema = z.object({
  title: z.string(),
  json: z.string(),
});
// Updated schemas to match backend table structure
export const commandSchema = z.object({
  id: z.string(), // VARCHAR(255) PK
  device_id: z.string(), // VARCHAR(255)
  user_id: z.number().nullable(), // INT
  command: z.string(), // TEXT
  sent_at: z.string().nullable(), // DATETIME
  result: z.string().nullable(), // TEXT
  type: z.enum(["manual", "auto"]), // ENUM('manual','auto')
  status: z.enum(["active", "inactive"]), // ENUM('active','inactive')
  details: z.record(z.any()).nullable(), // JSON
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Command = z.infer<typeof commandSchema>;

// If you still need the old schemas for some parts of your app, you can keep them separately:
