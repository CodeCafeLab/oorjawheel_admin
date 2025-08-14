
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { customerSchema } from '@/app/customers/schema';

const CustomerFormSchema = customerSchema.omit({ id: true });

export async function addCustomer(values: z.infer<typeof CustomerFormSchema>) {
  /*
  try {
    const connection = await pool.getConnection();
    // Check if customer exists
    const [existing] = await connection.execute('SELECT email FROM customers WHERE email = ?', [values.email]);
    if ((existing as any[]).length > 0) {
      connection.release();
      return { success: false, message: 'Customer with this email already exists.' };
    }
    
    await connection.execute(
      'INSERT INTO customers (name, email, totalSpent, orders, status) VALUES (?, ?, ?, ?, ?)',
      [values.name, values.email, values.totalSpent, values.orders, values.status]
    );
    connection.release();
    revalidatePath('/customers');
    return { success: true, message: 'Customer added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add customer.' };
  }
  */
  console.log("Mock addCustomer:", values);
  revalidatePath('/customers');
  return { success: true, message: 'Customer added successfully (Mock).' };
}

export async function updateCustomer(id: string, values: z.infer<typeof CustomerFormSchema>) {
    /*
    try {
      const connection = await pool.getConnection();
      await connection.execute(
        'UPDATE customers SET name = ?, email = ?, totalSpent = ?, orders = ?, status = ? WHERE id = ?',
        [values.name, values.email, values.totalSpent, values.orders, values.status, id]
      );
      connection.release();
      revalidatePath('/customers');
      return { success: true, message: 'Customer updated successfully.' };
    } catch (error) {
      console.error('Database Error:', error);
      return { success: false, message: 'Failed to update customer.' };
    }
    */
    console.log("Mock updateCustomer:", id, values);
    revalidatePath('/customers');
    return { success: true, message: 'Customer updated successfully (Mock).' };
  }

export async function deleteCustomer(id: string) {
  /*
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM customers WHERE id = ?', [id]);
    connection.release();
    revalidatePath('/customers');
    return { success: true, message: 'Customer deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to delete customer.' };
  }
  */
  console.log("Mock deleteCustomer:", id);
  revalidatePath('/customers');
  return { success: true, message: 'Customer deleted successfully (Mock).' };
}
