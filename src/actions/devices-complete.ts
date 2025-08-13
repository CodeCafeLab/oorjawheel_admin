'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Enhanced schemas with all required columns
const DeviceFormSchema = z.object({
    deviceName: z.string().min(1, "Device name is required"),
    macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, "Invalid MAC address format"),
    deviceType: z.string().min(1, "Device type is required"),
    userId: z.string().nullable(),
    passcode: z.string().min(6, "Passcode must be at least 6 characters"),
    status: z.enum(["never_used", "active", "disabled"]),
    btName: z.string().optional(),
    warrantyStart: z.string().optional(),
    defaultCmd: z.string().optional(),
    firstConnectedAt: z.string().optional()
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
    
    // Validate MAC address format
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(values.macAddress)) {
      connection.release();
      return { success: false, message: 'Invalid MAC address format. Use XX:XX:XX:XX:XX:XX' };
    }
    
    // Check if MAC address already exists
    const [existingDevice] = await connection.execute(
      'SELECT id FROM devices WHERE mac_address = ?',
      [values.macAddress]
    );
    
    if (Array.isArray(existingDevice) && existingDevice.length > 0) {
      connection.release();
      return { success: false, message: 'A device with this MAC address already exists.' };
    }
    
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
    return { success: true, message: 'Device added successfully.', deviceId: (result as any).insertId };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add device.' };
  }
}

export async function updateDevice(id: string, values: z.infer<typeof DeviceFormSchema>) {
  try {
    const connection = await pool.getConnection();
    
    // Validate MAC address format
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(values.macAddress)) {
      connection.release();
      return { success: false, message: 'Invalid MAC address format. Use XX:XX:XX:XX:XX:XX' };
    }
    
    // Check if MAC address already exists for another device
    const [existingDevice] = await connection.execute(
      'SELECT id FROM devices WHERE mac_address = ? AND id != ?',
      [values.macAddress, id]
    );
    
    if (Array.isArray(existingDevice) && existingDevice.length > 0) {
      connection.release();
      return { success: false, message: 'Another device with this MAC address already exists.' };
    }
    
    const [result] = await connection.execute(
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
    
    const [device] = await connection.execute(
      'SELECT id FROM devices WHERE id = ?',
      [id]
    );
    
    if (Array.isArray(device) && device.length === 0) {
      connection.release();
      return { success: false, message: 'Device not found.' };
    }
    
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
    
    const [existingType] = await connection.execute(
      'SELECT id FROM device_masters WHERE deviceType = ?',
      [values.deviceType]
    );
    
    if (Array.isArray(existingType) && existingType.length > 0) {
      connection.release();
      return { success: false, message: 'A device type with this name already exists.' };
    }
    
    const [result] = await connection.execute(
      'INSERT INTO device_masters (deviceType, btServe, btChar, soundBtName, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [values.deviceType, values.btServe, values.btChar, values.soundBtName, values.status]
    );
    connection.release();
    revalidatePath('/devices');
    return { success: true, message: 'Device type added successfully.', masterId: (result as any).insertId };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add device type.' };
  }
}

export async function updateDeviceMaster(id: string, values: z.infer<typeof DeviceMasterFormSchema>) {
    try {
      const connection = await pool.getConnection();
      
      const [existingType] = await connection.execute(
        'SELECT id FROM device_masters WHERE deviceType = ? AND id != ?',
        [values.deviceType, id]
      );
      
      if (Array.isArray(existingType) && existingType.length > 0) {
        connection.release();
        return { success: false, message: 'Another device type with this name already exists.' };
      }

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