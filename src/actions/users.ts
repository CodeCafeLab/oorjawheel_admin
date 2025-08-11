
'use server';

import { z } from 'zod';
import { userFormSchema } from './schemas';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/hash';

export async function addUser(values: z.infer<typeof userFormSchema>) {
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
}

export async function updateUser(id: string, values: z.infer<typeof userFormSchema>) {
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
}

export async function deleteUser(id: string) {
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
}
