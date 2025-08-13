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

    // Check if user exists
    const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if ((users as any[]).length === 0) {
      connection.release();
      return { success: false, message: 'Invalid email or password.' };
    }

    const user = (users as any[])[0];

    // Check if user account is locked
    if (user.status === 'locked') {
        connection.release();
        return { success: false, message: 'Your account is locked. Please contact support.' };
    }

    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      connection.release();
      return { success: false, message: 'Invalid email or password.' };
    }

    connection.release();

    const session = await getSession();
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();
    
    return { success: true, message: 'Login successful!' };

  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}


export async function logout() {
    const session = await getSession();
    session.destroy();
    revalidatePath('/', 'layout');
    redirect('/login');
}
