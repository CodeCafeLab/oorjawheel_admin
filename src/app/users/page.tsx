
"use client";

import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { userSchema } from './schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserForm } from './user-form';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';


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
            devicesAssigned: JSON.parse(user.devicesAssigned)
        }));

        return z.array(userSchema).parse(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        // On error (e.g. table not found), return empty array
        return [];
    }
}

export default function UsersPage() {
    const [users, setUsers] = React.useState<z.infer<typeof userSchema>[]>([]);
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    const fetchUsers = React.useCallback(async () => {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
    }, []);

    React.useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleFormSuccess = () => {
      setOpen(false)
      fetchUsers()
      revalidatePath('/users') // This might not be needed with client-side refresh, but good practice.
    }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">User Management</h1>
          <p className="text-muted-foreground">
            Manage operators and their assigned devices.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new user account.
                    </DialogDescription>
                </DialogHeader>
                <UserForm onFormSuccess={handleFormSuccess} />
            </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
