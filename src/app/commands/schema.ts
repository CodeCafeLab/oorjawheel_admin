import { z } from "zod"

const manualCommandDetailsSchema = z.object({
  type: z.enum(["wheel", "sound", "light"]),
  command: z.string(),
});

const autoCommandDetailsSchema = z.object({
  title: z.string(),
  json: z.string(),
});

export const commandSchema = z.object({
  id: z.string(),
  type: z.enum(["manual", "auto"]),
  status: z.enum(["active", "inactive"]),
  details: z.union([manualCommandDetailsSchema, autoCommandDetailsSchema]),
})

export type Command = z.infer<typeof commandSchema>
