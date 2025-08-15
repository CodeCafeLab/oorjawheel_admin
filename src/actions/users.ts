
'use server';

import { z } from 'zod';
import { userFormSchema } from './schemas';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/hash';
import { User, userSchema } from '@/app/users/schema';

export async function addUser(values: z.infer<typeof userFormSchema>) {
  const { fullName, email, contactNumber, address, country, password, status = 'active' } = values;

  if (!password) {
    return { success: false, message: 'Password is required.' };
  }

  try {
    const connection = await pool.getConnection();

    const [existing] = await connection.execute('SELECT email FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      connection.release();
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    
    const [result] = await connection.execute(
      'INSERT INTO users (fullName, email, contactNumber, address, country, status, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [fullName, email, contactNumber, address, country, status, hashedPassword]
    );
    connection.release();

    revalidatePath('/users');

    return { success: true, message: 'User added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add user.' };
  }
}

export async function updateUser(id: string, values: z.infer<typeof userFormSchema>) {
    const { fullName, email, contactNumber, address, country, password, status = 'active' } = values;

    try {
        const connection = await pool.getConnection();

        let query = 'UPDATE users SET fullName = ?, email = ?, contactNumber = ?, address = ?, country = ?, status = ?';
        const params: (string|null)[] = [fullName, email, contactNumber, address, country, status];

        if (password) {
            const hashedPassword = await hashPassword(password);
            query += ', password_hash = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await connection.execute(query, params);
        connection.release();

        revalidatePath('/users');

        return { success: true, message: 'User updated successfully.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { success: false, message: 'Failed to update user.' };
    }
}

export async function deleteUser(id: string) {
    try {
        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        connection.release();

        revalidatePath('/users');
        return { success: true, message: 'User deleted successfully.' };

    } catch (error) {
        console.error('Database Error:', error);
        return { success: false, message: 'Failed to delete user.' };
    }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(`
        SELECT 
            u.id, u.fullName, u.email, u.contactNumber, u.address, u.country, u.status, u.first_login_at AS firstLoginAt,
            GROUP_CONCAT(ud.device_id) as devicesAssigned
        FROM users u
        LEFT JOIN user_devices ud ON u.id = ud.user_id
        GROUP BY u.id
    `);

    connection.release();
    
    const users = (rows as any[]).map(user => ({
        ...user,
        devicesAssigned: user.devicesAssigned ? user.devicesAssigned.split(',').map((d:string) => `DeviceID-${d}`) : [],
    }));

    return z.array(userSchema).parse(users);

  } catch (error) {
    console.error('Database Error fetching users:', error);
    return [];
  }
}
