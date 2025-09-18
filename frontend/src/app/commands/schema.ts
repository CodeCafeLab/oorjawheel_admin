import { z } from "zod";

export const manualCommandDetailsSchema = z.object({
  type: z.enum(["wheel", "sound", "light"]),
  command: z.string(),
});

export const autoCommandDetailsSchema = z.object({
  title: z.string(),
  json: z.string(),
});
// Updated schemas to match your backend API
export const commandSchema = z.object({
  id: z.string(),
  device_id: z.number(),
  user_id: z.number(),
  command: z.string(), // This should be a JSON string
  sent_at: z.string().datetime(),
  result: z.string(),
  type: z.enum(["manual", "auto"]),
  status: z.enum(["active", "inactive"]),
  details: z.union([manualCommandDetailsSchema, autoCommandDetailsSchema]),
});

export type Command = z.infer<typeof commandSchema>;

// If you still need the old schemas for some parts of your app, you can keep them separately:
