
'use client';

import { userSchema, User } from './schema';
import { UsersClient } from './users-client';
import { z } from 'zod';
import * as React from 'react';

// MOCK DATA
const mockUsers: User[] = [
    {
      id: '1',
      fullName: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      contactNumber: '9876543210',
      address: '123 Tech Park, Bangalore',
      country: 'India',
      status: 'active',
      firstLoginAt: new Date('2023-01-15T09:00:00Z').toISOString(),
      devicesAssigned: ['OorjaWheel-A1B2', 'OorjaLight-C3D4'],
    },
    {
      id: '2',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      contactNumber: '8765432109',
      address: '456 Innovation Hub, Pune',
      country: 'India',
      status: 'active',
      firstLoginAt: new Date('2023-02-20T11:30:00Z').toISOString(),
      devicesAssigned: ['OorjaSound-E5F6'],
    },
    {
      id: '3',
      fullName: 'Amit Singh',
      email: 'amit.singh@example.com',
      contactNumber: '7654321098',
      address: '789 Silicon Towers, Hyderabad',
      country: 'India',
      status: 'locked',
      firstLoginAt: new Date('2023-03-10T14:00:00Z').toISOString(),
      devicesAssigned: [],
    },
];

async function getUsers(): Promise<User[]> {
    try {
        const parsedUsers = userSchema.array().safeParse(mockUsers);
        if (!parsedUsers.success) {
            console.error('Failed to parse mock users:', parsedUsers.error.flatten().fieldErrors);
            return [];
        }
        return parsedUsers.data;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}

export default function UsersPage() {
    const [users, setUsers] = React.useState<User[]>([]);

    React.useEffect(() => {
        getUsers().then(setUsers);
    }, []);

    return <UsersClient initialUsers={users} />;
}
