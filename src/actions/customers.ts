
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { customerSchema, Customer } from '@/app/customers/schema';

const CustomerFormSchema = customerSchema.omit({ id: true });

export async function fetchCustomers(): Promise<Customer[]> {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                u.id, 
                u.fullName as name, 
                u.email, 
                u.status,
                0 as totalSpent,
                0 as orders
            FROM users u
            WHERE u.id IN (SELECT DISTINCT user_id FROM user_devices)
            GROUP BY u.id
        `);
        connection.release();

        const customers = (rows as any[]).map(user => ({
            id: user.id.toString(),
            name: user.name || 'N/A',
            email: user.email,
            totalSpent: parseFloat(user.totalSpent || 0),
            orders: parseInt(user.orders || 0),
            status: user.status === 'locked' ? 'inactive' : 'active',
        }));

        return z.array(customerSchema).parse(customers);
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return [];
    }
}


export async function addCustomer(values: z.infer<typeof CustomerFormSchema>) {
  try {
    const connection = await pool.getConnection();

    const [existing] = await connection.execute('SELECT email FROM users WHERE email = ?', [values.email]);
    if ((existing as any[]).length > 0) {
      connection.release();
      return { success: false, message: 'A user with this email already exists.' };
    }
    
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
