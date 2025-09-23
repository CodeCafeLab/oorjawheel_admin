
'use client';

import { z } from 'zod';
import { loginSchema } from './schemas';

export async function login(values: z.infer<typeof loginSchema>, redirectUrl?: string) {
  const { email, password } = values;

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');
    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, redirectUrl }),
    });

    const data = await response.json();

    if (data.success) {
      const { user, token } = data.data;
      
      // Store auth data in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      return { 
        success: true, 
        message: data.message,
        user,
        token,
        redirectUrl: data.data.redirectUrl || redirectUrl || '/'
      };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
}

export async function logout() {
  try {
    // Call logout endpoint if needed
    const token = localStorage.getItem('auth_token');
    if (token) {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}
