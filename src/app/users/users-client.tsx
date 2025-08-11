
"use client";

import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { userSchema, User } from './schema';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserForm } from './user-form';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Add New User</SheetTitle>
                    <SheetDescription>
                        Fill in the details to create a new user account.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-full">
                    <div className="p-4">
                        <UserForm onFormSuccess={handleFormSuccess} />
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
