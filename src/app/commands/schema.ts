import { z } from "zod"

export const commandSchema = z.object({
  id: z.string(),
  type: z.enum(["manual", "auto"]),
  status: z.enum(["active", "inactive"]),
})

export type Command = z.infer<typeof commandSchema>
