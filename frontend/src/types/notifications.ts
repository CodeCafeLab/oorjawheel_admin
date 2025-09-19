import { z } from 'zod';

// Notification schema
export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  user_id: z.number().nullable().optional(),
  user_name: z.string().optional(),
  user_email: z.string().optional(),
  image_url: z.string().optional(),
  type: z.enum(['info', 'alert', 'promotion', 'warning', 'success']),
  status: z.enum(['draft', 'scheduled', 'sent', 'failed']),
  scheduled_at: z.string().optional(),
  sent_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by_name: z.string().optional(),
  updated_by_name: z.string().optional(),
});

export type Notification = z.infer<typeof notificationSchema>;

// User schema for dropdown
export const userSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string(),
  status: z.string(),
});

export type User = z.infer<typeof userSchema>;

// Notification stats schema
export const notificationStatsSchema = z.object({
  total: z.number(),
  draft: z.number(),
  scheduled: z.number(),
  sent: z.number(),
  failed: z.number(),
  info: z.number(),
  alert: z.number(),
  promotion: z.number(),
  warning: z.number(),
  success: z.number(),
});

export type NotificationStats = z.infer<typeof notificationStatsSchema>;

// Form schema for creating/updating notifications
export const notificationFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  user_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
  type: z.enum(['info', 'alert', 'promotion', 'warning', 'success']).default('info'),
  status: z.enum(['draft', 'scheduled', 'sent', 'failed']).default('draft'),
  scheduled_at: z.string().nullable().optional(),
  schedule_immediately: z.boolean().optional(),
}).transform((data) => ({
  ...data,
  // Ensure type and status are not empty strings
  type: data.type || 'info',
  status: data.status || 'draft',
  // Convert empty strings and null to undefined for optional fields
  description: data.description === '' || data.description === null ? undefined : data.description,
  image_url: data.image_url === '' || data.image_url === null ? undefined : data.image_url,
  scheduled_at: data.scheduled_at === '' || data.scheduled_at === null ? undefined : data.scheduled_at,
  user_id: data.user_id === null ? undefined : data.user_id,
}));

export type NotificationFormData = z.infer<typeof notificationFormSchema>;
