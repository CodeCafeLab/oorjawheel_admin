
import { userSchema } from './schema';
import { UsersClient } from './users-client';
import { z } from 'zod';
import pool from '@/lib/db';

async function getUsers() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT 
                u.*, 
                (SELECT JSON_ARRAYAGG(d.deviceName) FROM devices d WHERE d.userId = u.id) as devicesAssigned
             FROM users u`
        );
        connection.release();

        const users = (rows as any[]).map(user => ({
            ...user,
            id: user.id.toString(),
            devicesAssigned: user.devicesAssigned ? JSON.parse(user.devicesAssigned) : [],
            firstLoginAt: user.created_at ? new Date(user.created_at).toISOString() : null,
        }));
        
        const parsedUsers = userSchema.array().safeParse(users);

        if (!parsedUsers.success) {
            console.error('Failed to parse users:', parsedUsers.error.flatten().fieldErrors);
            return [];
        }

        return parsedUsers.data;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}

export default async function UsersPage() {
    const users = await getUsers();

    return <UsersClient initialUsers={users} />;
}
