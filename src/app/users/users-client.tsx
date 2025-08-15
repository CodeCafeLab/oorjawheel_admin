
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
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserForm } from './user-form';
import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UsersClient({ initialUsers, onDataRefresh }: { initialUsers: User[], onDataRefresh: () => void }) {
    const [users, setUsers] = React.useState<User[]>(initialUsers);
    const [open, setOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);
    
    const handleFormSuccess = () => {
      setOpen(false)
      setSelectedUser(null)
      onDataRefresh();
    }

    const handleAddClick = () => {
        setSelectedUser(null);
        setOpen(true);
    }

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setOpen(true);
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
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
        </Button>
      </div>
      {users.length > 0 ? (
        <DataTable columns={columns(handleEditClick)} data={users} />
      ) : (
        <Card className="text-center py-20">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">No Users Found</CardTitle>
                <CardDescription>Get started by creating the first user account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="lg" onClick={handleAddClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First User
                </Button>
            </CardContent>
        </Card>
      )}

      <Sheet open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setSelectedUser(null);
      }}>
          <SheetContent>
              <SheetHeader>
                  <SheetTitle>{selectedUser ? "Edit User" : "Add New User"}</SheetTitle>
                  <SheetDescription>
                      {selectedUser ? "Update the details for this user." : "Fill in the details to create a new user account."}
                  </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-full">
                  <div className="px-6 py-4">
                      <UserForm onFormSuccess={handleFormSuccess} user={selectedUser} />
                  </div>
              </ScrollArea>
          </SheetContent>
      </Sheet>
    </div>
  );
}
