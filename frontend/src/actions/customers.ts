
'use client';

import { z } from 'zod';
import { customerSchema, Customer } from '@/app/customers/schema';

const CustomerFormSchema = customerSchema.omit({ id: true });

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const { fetchData } = await import('@/lib/api-utils');
    const data = await fetchData('/users?page=1&limit=1000') as { data: any[] };
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
    const { postData } = await import('@/lib/api-utils');
    await postData('/users', {
      fullName: values.name,
      email: values.email,
      status: values.status,
      password: tempPassword,
    });
    return { success: true, message: 'Customer added successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to add customer.' };
  }
}

export async function updateCustomer(id: string, values: z.infer<typeof CustomerFormSchema>) {
  try {
    const { updateData } = await import('@/lib/api-utils');
    await updateData(`/users/${id}`, { fullName: values.name, email: values.email, status: values.status });
    return { success: true, message: 'Customer updated successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to update customer.' };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const { deleteData } = await import('@/lib/api-utils');
    await deleteData(`/users/${id}`);
    return { success: true, message: 'Customer deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to delete customer.' };
  }
}
