
'use server';

import { z } from 'zod';
import { deviceEventSchema, DeviceEvent } from '@/app/logs/schema';
import apiClient from '@/lib/api-client';
import { revalidatePath } from 'next/cache';

const eventFormSchema = deviceEventSchema.omit({ id: true });

export async function fetchDeviceEvent(filters?: { deviceId?: string }): Promise<DeviceEvent[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.deviceId) {
      params.append('deviceId', filters.deviceId);
    }
    
    const { data } = await apiClient.get(`/device-events?${params.toString()}`);
    
    const eventList = data.data;

    if (!eventList || !Array.isArray(eventList)) {
      console.error("Invalid response format - data is not an array:", data);
      return [];
    }
    
    const transformedData = eventList.map((event: any) => ({
      id: event.id.toString(),
      deviceId: event.device_id.toString(),
      event: event.event,
      timestamp: event.timestamp,
    }));
    
    return z.array(deviceEventSchema).parse(transformedData);
  } catch (error) {
    console.error('Failed to fetch device events:', error);
    return [];
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export async function addDeviceEvent(values: z.infer<typeof eventFormSchema>) {
  try {
    // Ensure device_id is a number
    const deviceId = parseInt(values.deviceId, 10);
    if (isNaN(deviceId)) {
      throw new Error('Device ID must be a number');
    }

    const payload = {
      deviceId, // This will be converted to device_id in the backend
      event: values.event, // Should be one of: 'connect', 'disconnect', 'scan_fail'
    };

    console.log('Sending payload to server:', payload);

    const response = await fetch(`${API_BASE}/device-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      console.error('Server error response:', responseData);
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    console.log('Device event added successfully:', responseData);
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error in addDeviceEvent:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to add device event',
      error: error instanceof Error ? error : undefined
    };
  }
}

export async function updateDeviceEvent(id: string, values: z.infer<typeof eventFormSchema>) {
  try {
    const payload = {
      device_id: values.deviceId,
      event: values.event,
      timestamp: values.timestamp,
    };

    const response = await fetch(`${API_BASE}/device-events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update device event');
    }

    revalidatePath('/logs');
    return { success: true, message: 'Device event updated successfully.' };
  } catch (error: any) {
    console.error('Error updating device event:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update device event' 
    };
  }
}

export async function deleteDeviceEvent(id: string) {
  try {
    const response = await fetch(`${API_BASE}/device-events/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete device event');
    }

    revalidatePath('/logs');
    return { success: true, message: 'Device event deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting device event:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to delete device event' 
    };
  }
}
