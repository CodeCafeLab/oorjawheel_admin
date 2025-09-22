
'use client';

import { z } from 'zod';
import { loginSchema } from './schemas';

export async function login(values: z.infer<typeof loginSchema>, redirectUrl?: string) {
  const { email, password } = values;

  try {
    const response = await fetch('http://localhost:4000/api/auth/login', {
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
      await fetch('http://localhost:4000/api/auth/logout', {
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
