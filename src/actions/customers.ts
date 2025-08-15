
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { customerSchema } from '@/app/customers/schema';

// The schema has a `users` table, not a dedicated `customers` table.
// These actions should operate on the `users` table.
// I will adapt them to use the `users` table structure.

const CustomerFormSchema = customerSchema.omit({ id: true });

// Note: totalSpent and orders are not in the `users` table. They would need to be calculated.
// For now, I will add/update the core user info.

export async function addCustomer(values: z.infer<typeof CustomerFormSchema>) {
  try {
    const connection = await pool.getConnection();

    const [existing] = await connection.execute('SELECT email FROM users WHERE email = ?', [values.email]);
    if ((existing as any[]).length > 0) {
      connection.release();
      return { success: false, message: 'A user with this email already exists.' };
    }
    
    // The `users` table expects a password. We'll generate a random one for now.
    const tempPassword = Math.random().toString(36).slice(-8);
    const { hashPassword } = await import('@/lib/hash');
    const hashedPassword = await hashPassword(tempPassword);

    await connection.execute(
      'INSERT INTO users (fullName, email, status, password_hash) VALUES (?, ?, ?, ?)',
      [values.name, values.email, values.status, hashedPassword]
    );
    connection.release();
    revalidatePath('/customers');
    return { success: true, message: 'Customer added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add customer.' };
  }
}

export async function updateCustomer(id: string, values: z.infer<typeof CustomerFormSchema>) {
    try {
      const connection = await pool.getConnection();
      await connection.execute(
        'UPDATE users SET fullName = ?, email = ?, status = ? WHERE id = ?',
        [values.name, values.email, values.status, id]
      );
      connection.release();
      revalidatePath('/customers');
      return { success: true, message: 'Customer updated successfully.' };
    } catch (error) {
      console.error('Database Error:', error);
      return { success: false, message: 'Failed to update customer.' };
    }
}

export async function deleteCustomer(id: string) {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    connection.release();
    revalidatePath('/customers');
    return { success: true, message: 'Customer deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to delete customer.' };
  }
}
