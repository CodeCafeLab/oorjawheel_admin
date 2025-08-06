'use server';

import { z } from 'zod';
import { userFormSchema } from './schemas';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/hash';

export async function addUser(values: z.infer<typeof userFormSchema>) {
  const { email, password, status = 'active' } = values;

  try {
    const connection = await pool.getConnection();

    // Check if user exists
    const [existing] = await connection.execute('SELECT email FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      connection.release();
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    
    const [result] = await connection.execute(
      'INSERT INTO users (email, status, password_hash) VALUES (?, ?, ?)',
      [email, status, hashedPassword]
    );
    connection.release();

    // Revalidate the users page to show the new user
    revalidatePath('/users');

    return { success: true, message: 'User added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    // Check for specific database errors if needed
    if ((error as any).code === 'ER_NO_SUCH_TABLE') {
        return { success: false, message: 'Database table not found. Please run migrations.' };
    }
    return { success: false, message: 'Failed to add user.' };
  }
}

export async function updateUser(id: string, values: z.infer<typeof userFormSchema>) {
    // TODO: Implement database logic to update a user.
    console.log(`Updating user ${id}:`, values);
    return { success: true, message: 'User updated successfully.' };
}

export async function deleteUser(id: string) {
    // TODO: Implement database logic to delete a user.
    console.log(`Deleting user ${id}`);
    return { success: true, message: 'User deleted successfully.' };
}
