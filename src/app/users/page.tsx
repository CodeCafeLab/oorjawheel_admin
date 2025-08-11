import { userSchema } from './schema';
import { UsersClient } from './users-client';
import { z } from 'zod';

async function getUsers() {
    try {
        // MOCK DATA: In a real application, this would fetch from a database.
        const data = [
            { id: 1, fullName: "Rohan Sharma", email: "rohan.sharma@example.com", contactNumber: "+919876543210", address: "123 MG Road, Bangalore", country: "India", status: "active", created_at: "2023-10-26T10:00:00Z", devicesAssigned: '["OorjaWheel-A1B2", "OorjaWheel-F3G4"]' },
            { id: 2, fullName: "Priya Patel", email: "priya.patel@example.com", contactNumber: "+919123456789", address: "456 Park Street, Mumbai", country: "India", status: "active", created_at: "2023-10-25T11:30:00Z", devicesAssigned: '["OorjaLight-C5D6"]' },
            { id: 3, fullName: "Amit Singh", email: "amit.singh@example.com", contactNumber: "+919988776655", address: "789 Connaught Place, New Delhi", country: "India", status: "locked", created_at: "2023-10-24T09:00:00Z", devicesAssigned: '[]' },
        ];

        const users = data.map(user => ({
            ...user,
            id: user.id.toString(), // Ensure ID is a string
            devicesAssigned: JSON.parse(user.devicesAssigned),
            firstLoginAt: user.created_at ? new Date(user.created_at).toISOString() : null,
        }));
        
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
