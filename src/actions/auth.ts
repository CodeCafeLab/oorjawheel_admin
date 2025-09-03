"use server";

import { z } from "zod";
import { loginSchema, registerSchema } from "./schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
const TOKEN_COOKIE = 'auth_token';
const USER_COOKIE = 'user_data';

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      name?: string;
      role: string;
      status: string;
    };
    token: string;
  };
}

// Helper function to handle API requests
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include' as RequestCredentials, // Include cookies in all requests
      ...options,
    };

    // Add auth token if available in cookies
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    const response = await fetch(`${API_BASE}${endpoint}`, defaultOptions);
    
    // Check content type before parsing as JSON
    const contentType = response.headers.get('content-type') || '';
    let data;
    
    try {
      data = contentType.includes('application/json') 
        ? await response.json() 
        : await response.text();
    } catch (error) {
      // If JSON parsing fails, try to get the response as text
      const text = await response.text();
      console.error('Failed to parse response:', { status: response.status, text });
      return { 
        error: `Request failed with status ${response.status}: ${text.substring(0, 100)}` 
      };
    }

    if (!response.ok) {
      return { 
        error: (data && (data.message || data.error)) || 
               `API request failed with status ${response.status}` 
      };
    }

    return { data };
  } catch (error: any) {
    console.error('API Request Error:', error);
    return { error: error.message || 'An error occurred' };
  }
}

export async function login(values: z.infer<typeof loginSchema>) {
  try {
    const { data, error } = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(values),
    });

    if (error || !data?.success) {
      return { 
        success: false, 
        message: error || data?.message || 'Login failed' 
      };
    }

    // Set auth cookies
    if (data.data) {
      const cookieStore = await cookies();
      cookieStore.set(TOKEN_COOKIE, data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      cookieStore.set(USER_COOKIE, JSON.stringify(data.data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return { 
      success: true, 
      message: 'Login successful!',
      user: data.data?.user 
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during login',
    };
  }
}

export async function register(values: z.infer<typeof registerSchema>) {
  try {
    const { data, error } = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(values),
    });

    if (error || !data?.success) {
      return { 
        success: false, 
        message: error || data?.message || 'Registration failed' 
      };
    }

    return { 
      success: true, 
      message: 'Registration successful! Please login.',
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during registration',
    };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  // Clear auth cookies by setting them to expire in the past
  cookieStore.set(TOKEN_COOKIE, '', { expires: new Date(0), path: '/' });
  cookieStore.set(USER_COOKIE, '', { expires: new Date(0), path: '/' });
  
  // Revalidate and redirect
  revalidatePath('/', 'layout');
  redirect('/login');
}
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userData = cookieStore.get(USER_COOKIE)?.value;
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return false;

  try {
    const { data } = await apiRequest<AuthResponse>('/auth/me');
    return !!data?.success;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}
