
'use server';

import { z } from 'zod';
import { userFormSchema } from './schemas';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/hash';
import { User } from '@/app/users/schema';

export async function addUser(values: z.infer<typeof userFormSchema>) {
  /*
  const { fullName, email, contactNumber, address, country, password, status = 'active' } = values;

  if (!password) {
    return { success: false, message: 'Password is required.' };
  }

  try {
    const connection = await pool.getConnection();

    // Check if user exists
    const [existing] = await connection.execute('SELECT email FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      connection.release();
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    
    // Note: You might need to alter your `users` table to include the new columns
    // ALTER TABLE users ADD COLUMN fullName VARCHAR(255), ADD COLUMN contactNumber VARCHAR(255), ADD COLUMN address TEXT, ADD COLUMN country VARCHAR(255);
    const [result] = await connection.execute(
      'INSERT INTO users (fullName, email, contactNumber, address, country, status, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fullName, email, contactNumber, address, country, status, hashedPassword]
    );
    connection.release();

    revalidatePath('/users');

    return { success: true, message: 'User added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    if ((error as any).code === 'ER_NO_SUCH_TABLE') {
        return { success: false, message: 'Database table not found. Please run migrations.' };
    }
    // Handle missing columns error
    if ((error as any).code === 'ER_BAD_FIELD_ERROR') {
        return { success: false, message: 'Database schema mismatch. Please alter your users table to include the new fields.' };
    }
    return { success: false, message: 'Failed to add user.' };
  }
  */
  console.log("Mock addUser:", values);
  revalidatePath('/users');
  return { success: true, message: 'User added successfully (Mock).' };
}

export async function updateUser(id: string, values: z.infer<typeof userFormSchema>) {
    /*
    const { fullName, email, contactNumber, address, country, password, status = 'active' } = values;

    try {
        const connection = await pool.getConnection();

        let query = 'UPDATE users SET fullName = ?, email = ?, contactNumber = ?, address = ?, country = ?, status = ?';
        const params: (string|null)[] = [fullName, email, contactNumber, address, country, status];

        if (password) {
            const hashedPassword = await hashPassword(password);
            query += ', password_hash = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await connection.execute(query, params);
        connection.release();

        revalidatePath('/users');

        return { success: true, message: 'User updated successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { success: false, message: 'Failed to update user.' };
    }
    */
    console.log("Mock updateUser:", id, values);
    revalidatePath('/users');
    return { success: true, message: 'User updated successfully (Mock).' };
}

export async function deleteUser(id: string) {
    /*
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        connection.release();

        if ((result as any).affectedRows === 0) {
            return { success: false, message: 'User not found.' };
        }

        revalidatePath('/users');
        return { success: true, message: 'User deleted successfully.' };

    } catch (error) {
        console.error('Database Error:', error);
        return { success: false, message: 'Failed to delete user.' };
    }
    */
    console.log("Mock deleteUser:", id);
    revalidatePath('/users');
    return { success: true, message: 'User deleted successfully (Mock).' };
}

export async function fetchUsers(): Promise<User[]> {
  /*
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      `SELECT id, fullName, email, contactNumber, address, country, status, first_login_at AS firstLoginAt 
       FROM users`
    );

    connection.release();

    // Return rows as User[]
    return rows as any[];
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
  */
  const data = [
    { id: 1, fullName: 'Super Admin', email: 'super.admin@oorja.com', contactNumber: '+919876543210', address: '123 Tech Park, Bangalore', country: '+91', status: 'active', firstLoginAt: '2023-01-15T09:30:00Z', devicesAssigned: ['OorjaWheel-A1B2', 'OorjaWheel-C3D4'] },
    { id: 2, fullName: 'Operator 1', email: 'operator1@oorja.com', contactNumber: '+919123456789', address: '456 Tech City, Pune', country: '+91', status: 'active', firstLoginAt: '2023-02-20T11:00:00Z', devicesAssigned: ['OorjaWheel-E5F6'] },
    { id: 3, fullName: 'Operator 2', email: 'operator2@oorja.com', contactNumber: '+919988776655', address: '789 Info Lane, Hyderabad', country: '+91', status: 'locked', firstLoginAt: '2023-03-10T14:00:00Z', devicesAssigned: [] },
  ];
  return data as User[];
}
