
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { deviceSchema, deviceMasterSchema, Device, DeviceMaster } from '@/app/devices/schema';

// Enhanced schemas with validation
const DeviceFormSchema = deviceSchema.omit({ id: true });
const DeviceMasterFormSchema = deviceMasterSchema.omit({ id: true });

// --- Device Actions ---

export async function addDevice(values: z.infer<typeof DeviceFormSchema>) {
  /*
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
      'INSERT INTO devices (device_name, mac_address, device_type, user_id, passcode, status, bt_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [values.deviceName, values.macAddress, values.deviceType, values.userId, values.passcode, values.status, values.btName || null]
    );
    connection.release();
    revalidatePath('/devices');
    return { success: true, message: 'Device added successfully.', deviceId: (result as any).insertId };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add device.' };
  }
  */
  console.log("Mock addDevice:", values);
  revalidatePath('/devices');
  return { success: true, message: 'Device added successfully (Mock).' };
}

export async function updateDevice(id: string, values: z.infer<typeof DeviceFormSchema>) {
  /*
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
      'UPDATE devices SET device_name = ?, mac_address = ?, device_type = ?, user_id = ?, passcode = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [values.deviceName, values.macAddress, values.deviceType, values.userId, values.passcode, values.status, id]
    );
    connection.release();
    revalidatePath('/devices');
    return { success: true, message: 'Device updated successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to update device.' };
  }
  */
  console.log("Mock updateDevice:", id, values);
  revalidatePath('/devices');
  return { success: true, message: 'Device updated successfully (Mock).' };
}

export async function deleteDevice(id: string) {
  /*
  try {
    const connection = await pool.getConnection();
    
    // Check if device exists
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
  */
  console.log("Mock deleteDevice:", id);
  revalidatePath('/devices');
  return { success: true, message: 'Device deleted successfully (Mock).' };
}

// --- Device Master Actions ---

export async function addDeviceMaster(values: z.infer<typeof DeviceMasterFormSchema>) {
  /*
  try {
    const connection = await pool.getConnection();
    
    // Check if device type already exists
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
  */
  console.log("Mock addDeviceMaster:", values);
  revalidatePath('/devices');
  return { success: true, message: 'Device type added successfully (Mock).' };
}

export async function updateDeviceMaster(id: string, values: z.infer<typeof DeviceMasterFormSchema>) {
    /*
    try {
      const connection = await pool.getConnection();
      
      // Check if device type already exists for another master
      const [existingType] = await connection.execute(
        'SELECT id FROM device_masters WHERE deviceType = ? AND id != ?',
        [values.deviceType, id]
      );
      
      if (Array.isArray(existingType) && existingType.length > 0) {
        connection.release();
        return { success: false, message: 'Another device type with this name already exists.' };
      }
      
      const [result] = await connection.execute(
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
    */
    console.log("Mock updateDeviceMaster:", id, values);
    revalidatePath('/devices');
    return { success: true, message: 'Device type updated successfully (Mock).' };
  }

export async function deleteDeviceMaster(id: string) {
  /*
  try {
    const connection = await pool.getConnection();
    
    // Check if any devices are using this master
    const [devices] = await connection.execute(
      'SELECT COUNT(*) as count FROM devices WHERE deviceType = (SELECT deviceType FROM device_masters WHERE id = ?)',
      [id]
    );
    
    const count = (devices as any)[0].count;
    if (count > 0) {
      connection.release();
      return { success: false, message: 'Cannot delete device type. There are devices using this type.' };
    }
    
    await connection.execute('DELETE FROM device_masters WHERE id = ?', [id]);
    connection.release();
    revalidatePath('/devices');
    return { success: true, message: 'Device type deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to delete device type.' };
  }
  */
  console.log("Mock deleteDeviceMaster:", id);
  revalidatePath('/devices');
  return { success: true, message: 'Device type deleted successfully (Mock).' };
}

// Enhanced fetch functions with filtering and pagination
export async function fetchDevices(filters?: { status?: string; deviceType?: string; search?: string }): Promise<Device[]> {
  /*
  try {
    const connection = await pool.getConnection();
    let query = 'SELECT id, deviceName, macAddress, deviceType, userId, passcode, status, createdAt, updatedAt FROM devices WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters?.deviceType) {
      query += ' AND deviceType = ?';
      params.push(filters.deviceType);
    }
    
    if (filters?.search) {
      query += ' AND (deviceName LIKE ? OR macAddress LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const [rows] = await connection.execute(query, params);
    connection.release();
    return rows as any[];
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
  */
  const data = [
    { id: '1', deviceName: 'Living Room Wheel', macAddress: '00:1A:2B:3C:4D:5E', deviceType: 'OorjaWheel v2', userId: 'user123', passcode: '3C4D5E', status: 'active' as const },
    { id: '2', deviceName: 'Bedroom Light', macAddress: 'F0:9A:8B:7C:6D:5E', deviceType: 'OorjaLight', userId: 'user123', passcode: '7C6D5E', status: 'active' as const },
    { id: '3', deviceName: 'Kitchen Hub', macAddress: 'A1:B2:C3:D4:E5:F6', deviceType: 'OorjaHub', userId: null, passcode: 'D4E5F6', status: 'never_used' as const },
    { id: '4', deviceName: 'Office Sensor', macAddress: '12:34:56:78:90:AB', deviceType: 'OorjaSensor', userId: 'user456', passcode: '7890AB', status: 'disabled' as const },
  ];
  return z.array(deviceSchema).parse(data);
}

export async function fetchDeviceMasters(filters?: { status?: string; search?: string }): Promise<DeviceMaster[]> {
  /*
  try {
    const connection = await pool.getConnection();
    let query = 'SELECT id, deviceType, btServe, btChar, soundBtName, status, createdAt, updatedAt FROM device_masters WHERE 1=1';
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
    console.error('Database Error:', error);
    return [];
  }
  */
  const data = [
    { id: '1', deviceType: 'OorjaWheel v2', btServe: 'uuid-serve-wheel', btChar: 'uuid-char-wheel', soundBtName: 'OorjaAudioV2', status: 'active' as const },
    { id: '2', deviceType: 'OorjaLight', btServe: 'uuid-serve-light', btChar: 'uuid-char-light', soundBtName: 'OorjaAudio-Light', status: 'active' as const },
    { id: '3', deviceType: 'OorjaHub', btServe: 'uuid-serve-hub', btChar: 'uuid-char-hub', soundBtName: 'N/A', status: 'inactive' as const },
    { id: '4', deviceType: 'OorjaSensor', btServe: 'uuid-serve-sensor', btChar: 'uuid-char-sensor', soundBtName: 'N/A', status: 'active' as const },
  ];
  return z.array(deviceMasterSchema).parse(data);
}

// Additional utility functions
export async function getDeviceById(id: string) {
  /*
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    );
    connection.release();
    return (rows as any[])[0] || null;
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
  */
  const devices = await fetchDevices();
  return devices.find(d => d.id === id) || null;
}

export async function getDeviceMasterById(id: string) {
  /*
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM device_masters WHERE id = ?',
      [id]
    );
    connection.release();
    return (rows as any[])[0] || null;
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
  */
  const masters = await fetchDeviceMasters();
  return masters.find(m => m.id === id) || null;
}

export async function getDeviceCount(filters?: { status?: string; deviceType?: string }) {
  /*
  try {
    const connection = await pool.getConnection();
    let query = 'SELECT COUNT(*) as count FROM devices WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters?.deviceType) {
      query += ' AND deviceType = ?';
      params.push(filters.deviceType);
    }
    
    const [rows] = await connection.execute(query, params);
    connection.release();
    return (rows as any[])[0].count;
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
  */
  const devices = await fetchDevices(filters);
  return devices.length;
}

export async function getDeviceMasterCount(filters?: { status?: string }) {
  /*
  try {
    const connection = await pool.getConnection();
    let query = 'SELECT COUNT(*) as count FROM device_masters WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    const [rows] = await connection.execute(query, params);
    connection.release();
    return (rows as any[])[0].count;
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
  */
  const masters = await fetchDeviceMasters(filters);
  return masters.length;
}

// Bulk operations
export async function bulkDeleteDevices(ids: string[]) {
  /*
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
  */
  console.log("Mock bulkDeleteDevices:", ids);
  revalidatePath('/devices');
  return { success: true, message: `${ids.length} devices deleted successfully (Mock).` };
}

export async function bulkDeleteDeviceMasters(ids: string[]) {
  /*
  try {
    const connection = await pool.getConnection();
    
    // Check for devices using these masters
    const placeholders = ids.map(() => '?').join(',');
    const [devices] = await connection.execute(
      `SELECT COUNT(*) as count FROM devices WHERE deviceType IN (SELECT deviceType FROM device_masters WHERE id IN (${placeholders}))`,
      ids
    );
    
    const count = (devices as any)[0].count;
    if (count > 0) {
      connection.release();
      return { success: false, message: 'Cannot delete device types. Some have devices using them.' };
    }
    
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
  */
  console.log("Mock bulkDeleteDeviceMasters:", ids);
  revalidatePath('/devices');
  return { success: true, message: `${ids.length} device types deleted successfully (Mock).` };
}
