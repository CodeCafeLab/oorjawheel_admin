'use server';

import { z } from 'zod';
import { loginSchema } from './schemas';
import pool from '@/lib/db';
import { comparePassword } from '@/lib/hash';

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

    // In a real app, you would create a session here (e.g., using JWT or a session library)
    // For now, we just return success.
    
    return { success: true, message: 'Login successful!' };

  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
