
'use server';

import { api } from '@/lib/api-client';
import { z } from 'zod';
import { userFormSchema } from './schemas';
import type { User } from '@/app/users/schema';

export async function addUser(values: z.infer<typeof userFormSchema>) {
  try {
    await api.post('/users', {
      fullName: values.fullName,
      email: values.email,
      contactNumber: values.contactNumber,
      address: values.address,
      country: values.country,
      status: values.status || 'active',
      password_hash: values.password, // optionally hash on backend
    });
    return { success: true, message: 'User added successfully.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function updateUser(id: string, values: z.infer<typeof userFormSchema>) {
  const { fullName, email, contactNumber, address, country, password, status = 'active' } = values;
  try {
    await api.put(`/users/${id}`, {
      fullName,
      email,
      contactNumber,
      address,
      country,
      status,
      ...(password ? { password } : {}),
    });
    return { success: true, message: 'User updated successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to update user.' };
  }
}

export async function deleteUser(id: string) {
  try {
    await api.delete(`/users/${id}`);
    return { success: true, message: 'User deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to delete user.' };
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const { data } = await api.get('/users', { params: { page: 1, limit: 1000 } });
    return data?.data ?? [];
  } catch (error) {
    return [];
  }
}
