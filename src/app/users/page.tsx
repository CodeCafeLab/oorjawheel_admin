
import { z } from 'zod';
import { userSchema } from './schema';
import pool from '@/lib/db';
import { UsersClient } from './users-client';

async function getUsers() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT id, email, status, created_at as firstLoginAt, '[]' as devicesAssigned 
             FROM users 
             ORDER BY created_at DESC`
        );
        connection.release();

        // The devicesAssigned is mocked as an empty array string.
        // The database query needs to be updated to fetch actual device assignments.
        const users = (rows as any[]).map(user => ({
            ...user,
            devicesAssigned: JSON.parse(user.devicesAssigned),
            // Convert created_at to a serializable format (ISO string)
            firstLoginAt: user.created_at ? new Date(user.created_at).toISOString() : null,
        }));

        return z.array(userSchema).parse(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        // On error (e.g. table not found), return empty array
        return [];
    }
}

export default async function UsersPage() {
    const users = await getUsers();

    return <UsersClient initialUsers={users} />;
}
