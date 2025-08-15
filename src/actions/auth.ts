
'use server';

import { z } from 'zod';
import { loginSchema } from './schemas';
import pool from '@/lib/db';
import { comparePassword } from '@/lib/hash';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(values: z.infer<typeof loginSchema>) {
  const { email, password } = values;

  try {
    const connection = await pool.getConnection();

    // Check if user exists in the admins table
    const [admins] = await connection.execute('SELECT * FROM admins WHERE email = ?', [email]);

    connection.release();

    if ((admins as any[]).length === 0) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const admin = (admins as any[])[0];

    const passwordMatch = await comparePassword(password, admin.password_hash);

    if (!passwordMatch) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const session = await getSession();
    session.email = admin.email;
    session.isLoggedIn = true;
    await session.save();

    return { success: true, message: 'Login successful!' };

  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'An internal error occurred. Please try again later.' };
  }
}


export async function logout() {
  const session = await getSession();
  session.destroy();
  revalidatePath('/', 'layout');
  redirect('/login');
}
