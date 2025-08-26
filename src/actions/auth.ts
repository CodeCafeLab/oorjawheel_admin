"use server";

import { z } from "zod";
import { loginSchema } from "./schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export async function login(values: z.infer<typeof loginSchema>) {
  const { email, password } = values;

  try {
    await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    return { success: true, message: "Login successful!" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Invalid email or password.",
    };
  }
}

export async function logout() {
  revalidatePath("/", "layout");
  redirect("/login");
}
