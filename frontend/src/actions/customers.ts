
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { customerSchema, Customer } from '@/app/customers/schema';
import { api } from '@/lib/api-client';

const CustomerFormSchema = customerSchema.omit({ id: true });

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const { data } = await api.get('/users', { params: { page: 1, limit: 1000 } });
    const customers = (data?.data || []).map((u: any) => ({
      id: String(u.id),
      name: u.fullName || 'N/A',
      email: u.email,
      totalSpent: 0,
      orders: 0,
      status: u.status === 'locked' ? 'inactive' : 'active',
    }));
    return z.array(customerSchema).parse(customers);
  } catch (error) {
    return [];
  }
}


export async function addCustomer(values: z.infer<typeof CustomerFormSchema>) {
  try {
    const tempPassword = Math.random().toString(36).slice(-8);
    await api.post('/users', {
      fullName: values.name,
      email: values.email,
      status: values.status,
      password: tempPassword,
    });
    revalidatePath('/customers');
    return { success: true, message: 'Customer added successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to add customer.' };
  }
}

export async function updateCustomer(id: string, values: z.infer<typeof CustomerFormSchema>) {
  try {
    await api.put(`/users/${id}`, { fullName: values.name, email: values.email, status: values.status });
    revalidatePath('/customers');
    return { success: true, message: 'Customer updated successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to update customer.' };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await api.delete(`/users/${id}`);
    revalidatePath('/customers');
    return { success: true, message: 'Customer deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to delete customer.' };
  }
}
