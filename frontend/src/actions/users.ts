"use client";

import { z } from "zod";
import { userFormSchema } from "./schemas";
import type { User } from "@/app/users/schema";

export async function addUser(values: z.infer<typeof userFormSchema>) {
  try {
    const { postData } = await import('@/lib/api-utils');
    await postData("/users", {
      fullName: values.fullName,
      email: values.email,
      contactNumber: values.contactNumber,
      address: values.address,
      country: values.country,
      status: values.status || "active",
      password_hash: values.password, // optionally hash on backend
    });
    return { success: true, message: "User added successfully." };
  } catch (e: any) {
    return { success: false, message: e.message };
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
    status = "active",
  } = values;
  try {
    const { updateData } = await import('@/lib/api-utils');
    await updateData(`/users/${id}`, {
      fullName,
      email,
      contactNumber,
      address,
      country,
      status,
      ...(password ? { password } : {}),
    });
    return { success: true, message: "User updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update user." };
  }
}

export async function deleteUser(id: string) {
  try {
    const { deleteData } = await import('@/lib/api-utils');
    await deleteData(`/users/${id}`);
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    return { success: false, message: "Failed to delete user." };
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const { fetchData } = await import('@/lib/api-utils');
    const data = await fetchData("/users?page=1&limit=1000") as { data: User[] };
    return data?.data ?? [];
  } catch (error) {
    return [];
  }
}

export async function fetchUserById(id: string | number): Promise<Partial<User> & { password?: string } | undefined> {
  try {
    const { fetchData } = await import('@/lib/api-utils');
    const data = await fetchData(`/users/${id}`) as any;
    // Some backends wrap result in { data: {...} }
    return (data?.data ?? data) as Partial<User> & { password?: string };
  } catch (error) {
    return undefined;
  }
}
