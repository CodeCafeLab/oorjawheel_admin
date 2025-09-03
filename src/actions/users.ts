"use server";

import { z } from "zod";
import { userFormSchema } from "./schemas";
import type { User } from "@/app/users/schema";

export async function addUser(values: z.infer<typeof userFormSchema>) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiBase}/users`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: values.fullName,
        email: values.email,
        contactNumber: values.contactNumber,
        address: values.address,
        country: values.country,
        status: values.status || 'active',
        password: values.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add user');
    }

    return { success: true, message: 'User added successfully.' };
  } catch (error: any) {
    console.error('Add user error:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to add user. Please try again.' 
    };
  }
}

export async function updateUser(
  id: string,
  values: z.infer<typeof userFormSchema>
) {
  const {
    fullName,
    email,
    contactNumber,
    address,
    country,
    password,
    status = 'active',
  } = values;
  
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiBase}/users/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName,
        email,
        contactNumber,
        address,
        country,
        status,
        ...(password ? { password } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user');
    }

    return { success: true, message: 'User updated successfully.' };
  } catch (error: any) {
    console.error('Update user error:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update user. Please try again.' 
    };
  }
}

export async function deleteUser(id: string) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiBase}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete user');
    }

    return { 
      success: true, 
      message: 'User deleted successfully.' 
    };
  } catch (error: any) {
    console.error('Delete user error:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to delete user. Please try again.' 
    };
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
    const res = await fetch(
      `${apiBase}/users?page=1&limit=1000`,
      { 
        cache: "no-store",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!res.ok) {
      console.error('Failed to fetch users:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}
