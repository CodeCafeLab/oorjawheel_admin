
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { deviceSchema, deviceMasterSchema } from '@/app/devices/schema';

// Schemas for validation, omitting ID as it's auto-generated or route param
const DeviceFormSchema = deviceSchema.omit({ id: true });
const DeviceMasterFormSchema = deviceMasterSchema.omit({ id: true });


// --- Device Actions ---

export async function addDevice(values: z.infer<typeof DeviceFormSchema>) {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO devices (deviceName, macAddress, deviceType, userId, passcode, status) VALUES (?, ?, ?, ?, ?, ?)',
      [values.deviceName, values.macAddress, values.deviceType, values.userId, values.passcode, values.status]
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
      'UPDATE devices SET deviceName = ?, macAddress = ?, deviceType = ?, userId = ?, passcode = ?, status = ? WHERE id = ?',
      [values.deviceName, values.macAddress, values.deviceType, values.userId, values.passcode, values.status, id]
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
    const [result] = await connection.execute(
      'INSERT INTO device_masters (deviceType, btServe, btChar, soundBtName, status) VALUES (?, ?, ?, ?, ?)',
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
        'UPDATE device_masters SET deviceType = ?, btServe = ?, btChar = ?, soundBtName = ?, status = ? WHERE id = ?',
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
