
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const DeviceFormSchema = z.object({
    deviceName: z.string().min(1, "Device name is required"),
    macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, "Invalid MAC address format"),
    deviceType: z.string().min(1, "Device type is required"),
    userId: z.string().nullable(),
    passcode: z.string().min(6, "Passcode must be at least 6 characters"),
    status: z.enum(["never_used", "active", "disabled"]),
    btName: z.string().optional(),
    warrantyStart: z.string().optional().nullable(),
    defaultCmd: z.string().optional(),
    firstConnectedAt: z.string().optional().nullable()
});

const DeviceMasterFormSchema = z.object({
    deviceType: z.string().min(1, "Device type name is required"),
    btServe: z.string().min(1, "BT service UUID is required"),
    btChar: z.string().min(1, "BT characteristic UUID is required"),
    soundBtName: z.string().min(1, "Sound BT name is required"),
    status: z.enum(["active", "inactive"])
});

// --- Device Actions ---

export async function addDevice(values: z.infer<typeof DeviceFormSchema>) {
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO devices (device_name, mac_address, device_type, user_id, passcode, status, bt_name, warranty_start, default_cmd, first_connected_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [
        values.deviceName,
        values.macAddress,
        values.deviceType,
        values.userId,
        values.passcode,
        values.status,
        values.btName || null,
        values.warrantyStart || null,
        values.defaultCmd || null,
        values.firstConnectedAt || null
      ]
    );
    connection.release();
    revalidatePath('/devices');
    return { success: true, message: 'Device added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add device.' };
  }
}

export async function updateDevice(id: string, values: z.infer<typeof DeviceFormSchema>) {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(
      'UPDATE devices SET device_name = ?, mac_address = ?, device_type = ?, user_id = ?, passcode = ?, status = ?, bt_name = ?, warranty_start = ?, default_cmd = ?, first_connected_at = ?, updated_at = NOW() WHERE id = ?',
      [
        values.deviceName,
        values.macAddress,
        values.deviceType,
        values.userId,
        values.passcode,
        values.status,
        values.btName || null,
        values.warrantyStart || null,
        values.defaultCmd || null,
        values.firstConnectedAt || null,
        id
      ]
    );
    connection.release();
    revalidatePath('/devices');
    return { success: true, message: 'Device updated successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to update device.' };
  }
}

export async function deleteDevice(id: string) {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM devices WHERE id = ?', [id]);
    connection.release();
    revalidatePath('/devices');
    return { success: true, message: 'Device deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to delete device.' };
  }
}

// --- Device Master Actions ---

export async function addDeviceMaster(values: z.infer<typeof DeviceMasterFormSchema>) {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(
      'INSERT INTO device_masters (deviceType, btServe, btChar, soundBtName, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [values.deviceType, values.btServe, values.btChar, values.soundBtName, values.status]
    );
    connection.release();
    revalidatePath('/devices');
    return { success: true, message: 'Device type added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add device type.' };
  }
}

export async function updateDeviceMaster(id: string, values: z.infer<typeof DeviceMasterFormSchema>) {
    try {
      const connection = await pool.getConnection();
      
      await connection.execute(
        'UPDATE device_masters SET deviceType = ?, btServe = ?, btChar = ?, soundBtName = ?, status = ?, updatedAt = NOW() WHERE id = ?',
        [values.deviceType, values.btServe, values.btChar, values.soundBtName, values.status, id]
      );
      connection.release();
      revalidatePath('/devices');
      return { success: true, message: 'Device type updated successfully.' };
    } catch (error) {
      console.error('Database Error:', error);
      return { success: false, message: 'Failed to update device type.' };
    }
}

export async function deleteDeviceMaster(id: string) {
    try {
      const connection = await pool.getConnection();
      await connection.execute('DELETE FROM device_masters WHERE id = ?', [id]);
      connection.release();
      revalidatePath('/devices');
      return { success: true, message: 'Device type deleted successfully.' };
    } catch (error) {
      console.error('Database Error:', error);
      return { success: false, message: 'Failed to delete device type.' };
    }
}

// --- Data Fetching ---

export async function fetchDevices(filters?: { status?: string; deviceType?: string; search?: string }) {
    try {
      const connection = await pool.getConnection();
      let query = 'SELECT * FROM devices WHERE 1=1';
      const params: any[] = [];
      
      if (filters?.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters?.deviceType) {
        query += ' AND device_type = ?';
        params.push(filters.deviceType);
      }
      
      if (filters?.search) {
        query += ' AND (device_name LIKE ? OR mac_address LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await connection.execute(query, params);
      connection.release();
      return rows as any[];
    } catch (error) {
      console.error('Database Error fetching devices:', error);
      return [];
    }
  }
  
  export async function fetchDeviceMasters(filters?: { status?: string; search?: string }) {
    try {
      const connection = await pool.getConnection();
      let query = 'SELECT * FROM device_masters WHERE 1=1';
      const params: any[] = [];
      
      if (filters?.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters?.search) {
        query += ' AND deviceType LIKE ?';
        params.push(`%${filters.search}%`);
      }
      
      query += ' ORDER BY createdAt DESC';
      
      const [rows] = await connection.execute(query, params);
      connection.release();
      return rows as any[];
    } catch (error) {
      console.error('Database Error fetching device masters:', error);
      return [];
    }
  }

  export async function bulkDeleteDevices(ids: string[]) {
    if (ids.length === 0) return { success: true, message: 'No devices selected.' };
    try {
      const connection = await pool.getConnection();
      const placeholders = ids.map(() => '?').join(',');
      await connection.execute(
        `DELETE FROM devices WHERE id IN (${placeholders})`,
        ids
      );
      connection.release();
      revalidatePath('/devices');
      return { success: true, message: `${ids.length} devices deleted successfully.` };
    } catch (error) {
      console.error('Database Error:', error);
      return { success: false, message: 'Failed to delete devices.' };
    }
  }
  
  export async function bulkDeleteDeviceMasters(ids: string[]) {
    if (ids.length === 0) return { success: true, message: 'No device types selected.' };
    try {
      const connection = await pool.getConnection();
      
      const placeholders = ids.map(() => '?').join(',');
      
      await connection.execute(
        `DELETE FROM device_masters WHERE id IN (${placeholders})`,
        ids
      );
      connection.release();
      revalidatePath('/devices');
      return { success: true, message: `${ids.length} device types deleted successfully.` };
    } catch (error) {
      console.error('Database Error:', error);
      return { success: false, message: 'Failed to delete device types.' };
    }
  }
