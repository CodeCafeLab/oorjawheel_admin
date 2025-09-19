
'use server';

import { z } from 'zod';
import { api } from '@/lib/api-client';

const DeviceFormSchema = z.object({
  deviceName: z.string().min(1),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/),
  deviceType: z.string().min(1),
  userId: z.string().nullable(),
  passcode: z.string().min(6),
  status: z.enum(['never_used', 'active', 'disabled']),
  btName: z.string().optional(),
  warrantyStart: z.string().optional().nullable(),
  defaultCmd: z.string().optional(),
  firstConnectedAt: z.string().optional().nullable(),
});

export async function addDevice(values: z.infer<typeof DeviceFormSchema>) {
  try {
    await api.post('/devices', {
      device_name: values.deviceName,
      mac_address: values.macAddress,
      device_type: values.deviceType,
      user_id: values.userId,
      passcode: values.passcode,
      status: values.status,
      bt_name: values.btName ?? '',
      warranty_start: values.warrantyStart || null,
      default_cmd: values.defaultCmd || null,
      first_connected_at: values.firstConnectedAt || null,
    });
    return { success: true, message: 'Device added successfully.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function updateDevice(id: string, values: z.infer<typeof DeviceFormSchema>) {
  try {
    await api.put(`/devices/${id}`, {
      device_name: values.deviceName,
      mac_address: values.macAddress,
      device_type: values.deviceType,
      user_id: values.userId,
      passcode: values.passcode,
      status: values.status,
      bt_name: values.btName ?? '',
      warranty_start: values.warrantyStart || null,
      default_cmd: values.defaultCmd || null,
      first_connected_at: values.firstConnectedAt || null,
    });
    return { success: true, message: 'Device updated successfully.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function deleteDevice(id: string) {
  try {
    await api.delete(`/devices/${id}`);
    return { success: true, message: 'Device deleted successfully.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function fetchDevices(filters?: { status?: string; deviceType?: string; search?: string; page?: number; limit?: number }) {
  try {
    const { data } = await api.get('/devices', { params: filters });
    return data?.data ?? [];
  } catch {
    return [];
  }
}

export async function getTotalDeviceCount(filters?: { status?: string; deviceType?: string; search?: string }) {
  try {
    const { data } = await api.get('/devices', { params: { ...filters, page: 1, limit: 1 } });
    return data?.total ?? 0;
  } catch {
    return 0;
  }
}

// ---- Device Masters ----

const DeviceMasterFormSchema = z.object({
  deviceType: z.string().min(1),
  btServe: z.string().min(1),
  btChar: z.string().min(1),
  soundBtName: z.string().min(1),
  status: z.enum(['active', 'inactive'])
});

export async function fetchDeviceMasters(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
  try {
    const { data } = await api.get('/device-masters', { params: filters });
    return data?.data ?? [];
  } catch {
    return [];
  }
}

export async function getTotalDeviceMasterCount(filters?: { status?: string; search?: string }) {
  try {
    const { data } = await api.get('/device-masters', { params: { ...filters, page: 1, limit: 1 } });
    return data?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function addDeviceMaster(values: z.infer<typeof DeviceMasterFormSchema>) {
  try {
    await api.post('/device-masters', values);
    return { success: true, message: 'Device type added successfully.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function updateDeviceMaster(id: string, values: z.infer<typeof DeviceMasterFormSchema>) {
  try {
    await api.put(`/device-masters/${id}`, values);
    return { success: true, message: 'Device type updated successfully.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function deleteDeviceMaster(id: string) {
  try {
    await api.delete(`/device-masters/${id}`);
    return { success: true, message: 'Device type deleted successfully.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

// ---- Bulk helpers ----

export async function bulkDeleteDevices(ids: string[]) {
  try {
    await Promise.all(ids.map((id) => api.delete(`/devices/${id}`)));
    return { success: true, message: `${ids.length} devices deleted successfully.` };
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to delete devices.' };
  }
}

export async function bulkDeleteDeviceMasters(ids: string[]) {
  try {
    await Promise.all(ids.map((id) => api.delete(`/device-masters/${id}`)));
    return { success: true, message: `${ids.length} device types deleted successfully.` };
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to delete device types.' };
  }
}