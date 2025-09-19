'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { 
  notificationSchema, 
  userSchema, 
  notificationStatsSchema, 
  notificationFormSchema,
  type Notification,
  type User,
  type NotificationStats,
  type NotificationFormData
} from '@/types/notifications';

// Get all notifications with pagination and filtering
export async function getNotifications(params: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  user_id?: number;
  search?: string;
} = {}): Promise<{ data: Notification[]; pagination: any }> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params.search) queryParams.append('search', params.search);

    const { data } = await api.get(`/notifications?${queryParams.toString()}`);
    
    const notifications = (data.data as any[]).map((row) => ({
      id: row.id?.toString?.() ?? String(row.id),
      title: row.title,
      description: row.description || '',
      user_id: row.user_id,
      user_name: row.user_name || '',
      user_email: row.user_email || '',
      image_url: row.image_url || '',
      type: row.type || 'info',
      status: row.status || 'draft',
      scheduled_at: row.scheduled_at || '',
      sent_at: row.sent_at || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by_name: row.created_by_name || '',
      updated_by_name: row.updated_by_name || '',
    }));
    
    
    // Try to parse with schema, but fallback if it fails
    try {
      return {
        data: z.array(notificationSchema).parse(notifications),
        pagination: data.pagination
      };
    } catch (parseError) {
      console.log('Notifications schema parse error:', parseError);
      console.log('Falling back to raw data...');
      return {
        data: notifications as Notification[],
        pagination: data.pagination
      };
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
}

// Get notification by ID
export async function getNotification(id: string): Promise<Notification | null> {
  try {
    const { data } = await api.get(`/notifications/${id}`);
    
    const notification = {
      id: data.data.id?.toString?.() ?? String(data.data.id),
      title: data.data.title,
      description: data.data.description || '',
      user_id: data.data.user_id,
      user_name: data.data.user_name || '',
      user_email: data.data.user_email || '',
      image_url: data.data.image_url || '',
      type: data.data.type || 'info',
      status: data.data.status || 'draft',
      scheduled_at: data.data.scheduled_at || '',
      sent_at: data.data.sent_at || '',
      created_at: data.data.created_at,
      updated_at: data.data.updated_at,
      created_by_name: data.data.created_by_name || '',
      updated_by_name: data.data.updated_by_name || '',
    };
    
    return notificationSchema.parse(notification);
  } catch (error) {
    console.error('Failed to fetch notification:', error);
    return null;
  }
}

// Get users for dropdown
export async function getUsers(): Promise<User[]> {
  try {
    const { data } = await api.get('/notifications/users');
    
    // Try to parse with schema, but fallback if it fails
    try {
      return z.array(userSchema).parse(data.data);
    } catch (parseError) {
      console.log('Users schema parse error:', parseError);
      console.log('Falling back to raw data...');
      return data.data as User[];
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

// Get notification statistics
export async function getNotificationStats(): Promise<NotificationStats | null> {
  try {
    const { data } = await api.get('/notifications/stats');
    
    // Try to parse with schema, but fallback to manual parsing if it fails
    try {
      return notificationStatsSchema.parse(data.data);
    } catch (parseError) {
      
      // Manual parsing with defaults
      const stats = {
        total: data.data?.total || 0,
        draft: data.data?.draft || 0,
        scheduled: data.data?.scheduled || 0,
        sent: data.data?.sent || 0,
        failed: data.data?.failed || 0,
        info: data.data?.info || 0,
        alert: data.data?.alert || 0,
        promotion: data.data?.promotion || 0,
        warning: data.data?.warning || 0,
        success: data.data?.success || 0,
      };
      
      return stats;
    }
  } catch (error) {
    console.error('Failed to fetch notification stats:', error);
    return null;
  }
}

// Create notification
export async function createNotification(values: NotificationFormData) {
  try {
    const validatedData = notificationFormSchema.parse(values);
    await api.post('/notifications', validatedData);
    revalidatePath('/notifications');
    return { success: true, message: 'Notification created successfully.' };
  } catch (error) {
    console.error('Failed to create notification:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return { success: false, message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, message: 'Failed to create notification.' };
  }
}

// Update notification
export async function updateNotification(id: string, values: NotificationFormData) {
  try {
    const validatedData = notificationFormSchema.parse(values);
    await api.put(`/notifications/${id}`, validatedData);
    revalidatePath('/notifications');
    return { success: true, message: 'Notification updated successfully.' };
  } catch (error) {
    console.error('Failed to update notification:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return { success: false, message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, message: 'Failed to update notification.' };
  }
}

// Delete notification
export async function deleteNotification(id: string) {
  try {
    await api.delete(`/notifications/${id}`);
    revalidatePath('/notifications');
    return { success: true, message: 'Notification deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return { success: false, message: 'Failed to delete notification.' };
  }
}

// Send notification
export async function sendNotification(id: string) {
  try {
    await api.post(`/notifications/${id}/send`);
    revalidatePath('/notifications');
    return { success: true, message: 'Notification sent successfully.' };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return { success: false, message: 'Failed to send notification.' };
  }
}

// Bulk delete notifications
export async function bulkDeleteNotifications(ids: string[]) {
  try {
    await api.post('/notifications/bulk-delete', { ids });
    revalidatePath('/notifications');
    return { success: true, message: `${ids.length} notifications deleted successfully.` };
  } catch (error) {
    console.error('Failed to bulk delete notifications:', error);
    return { success: false, message: 'Failed to delete notifications.' };
  }
}
