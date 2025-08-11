import { userSchema } from './schema';
import pool from '@/lib/db';
import { UsersClient } from './users-client';

async function getUsers() {
    try {
        const connection = await pool.getConnection();
        // Updated query to fetch new fields
        const [rows] = await connection.execute(
            `SELECT id, fullName, email, contactNumber, address, country, status, created_at, '["OorjaWheel-A1B2", "OorjaWheel-F3G4"]' as devicesAssigned 
             FROM users 
             ORDER BY created_at DESC`
        );
        connection.release();

        const users = (rows as any[]).map(user => ({
            ...user,
            id: user.id.toString(), // Ensure ID is a string
            devicesAssigned: JSON.parse(user.devicesAssigned),
            firstLoginAt: user.created_at ? new Date(user.created_at).toISOString() : null,
        }));

        // Use safeParse to handle potential validation errors gracefully
        const parsedUsers = userSchema.array().safeParse(users);

        if (!parsedUsers.success) {
            console.error('Failed to parse users:', parsedUsers.error.flatten().fieldErrors);
            return []; // Return empty array on parsing error
        }

        return parsedUsers.data;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        // On error (e.g. table not found or column missing), return empty array
        return [];
    }
}

export default async function UsersPage() {
    const users = await getUsers();

    return <UsersClient initialUsers={users} />;
}
