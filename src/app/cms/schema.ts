import { z } from "zod"

// Content Type Schema
export const contentTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  content_count: z.number().optional(),
  field_count: z.number().optional(),
  created_at: z.string().optional(),
})

export type ContentType = z.infer<typeof contentTypeSchema>

// Content Item Schema
export const contentItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string().optional(),
  status: z.string().default('draft'),
  featured_image: z.string().optional(),
  excerpt: z.string().optional(),
  content_type_id: z.string().optional(),
  content_type_name: z.string().optional(),
  category: z.string().optional(),
  command: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type ContentItem = z.infer<typeof contentItemSchema>

// Category Schema
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export type Category = z.infer<typeof categorySchema>
// In schema.ts
export const mediaFileSchema = z.object({
  id: z.string(),
  url: z.string(),
  thumbnail: z.string().nullable().optional(),
  filename: z.string().optional(),
  original_name: z.string().optional(),
  mime_type: z.string().optional(),
  size: z.number().optional(),
  created_at: z.string().optional(),
});

export type MediaFile = z.infer<typeof mediaFileSchema>;

// Field Type Schema
export const fieldTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  validation_rules: z.record(z.any()).optional(),
})

export type FieldType = z.infer<typeof fieldTypeSchema>

// Template Schema
export const templateSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  template_path: z.string(),
})

export type Template = z.infer<typeof templateSchema>

// Legacy compatibility
export const pageSchema = contentItemSchema
export type Page = ContentItem
