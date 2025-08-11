
"use client";

import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { userSchema, User } from './schema';
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

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = React.useState<User[]>(initialUsers);
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);
    
    const handleFormSuccess = () => {
      setOpen(false)
      // We need to refresh the data. Next.js router.refresh() is the way to do it.
      // It re-fetches data on the server for the current route.
      router.refresh();
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
