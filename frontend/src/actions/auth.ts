
'use server';

import { z } from 'zod';
import { loginSchema } from './schemas';
import { api } from '@/lib/api-client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(values: z.infer<typeof loginSchema>) {
  const { email, password } = values;

  try {
    await api.post('/auth/login', { email, password });

    return { success: true, message: 'Login successful!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Invalid email or password.' };
  }
}

export async function logout() {
  revalidatePath('/', 'layout');
  redirect('/login');
}
