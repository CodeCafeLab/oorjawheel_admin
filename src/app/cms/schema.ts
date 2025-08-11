import { z } from "zod"

export const pageSchema = z.object({
  id: z.string(),
  category: z.string(),
  image: z.string().url(),
  title: z.string(),
  command: z.string(),
  description: z.string(),
})

export type Page = z.infer<typeof pageSchema>
