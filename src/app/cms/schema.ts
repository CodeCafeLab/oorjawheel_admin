import { z } from "zod"

export const elementSchema = z.object({
    id: z.string(),
    sectionId: z.string(),
    type: z.enum(["button", "slider", "toggle", "media", "link"]),
    label: z.string(),
    payload: z.record(z.any())
});

export const sectionSchema = z.object({
    id: z.string(),
    pageId: z.string(),
    title: z.string(),
    order: z.number(),
    elements: z.array(elementSchema)
});

export const pageSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  status: z.enum(["published", "draft"]),
})

export type Page = z.infer<typeof pageSchema>
export type Section = z.infer<typeof sectionSchema>
export type Element = z.infer<typeof elementSchema>
