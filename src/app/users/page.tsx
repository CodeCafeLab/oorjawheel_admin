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


// Mock data fetching
async function getUsers() {
  // In a real app, you'd fetch this from your database.
  const data = [
    { id: "USER001", email: "super.admin@oorja.com", status: "active", firstLoginAt: "2024-01-15T10:00:00Z", devicesAssigned: ["DEV001", "DEV002", "DEV003"] },
    { id: "USER002", email: "operator1@oorja.com", status: "active", firstLoginAt: "2024-02-20T11:30:00Z", devicesAssigned: ["DEV004", "DEV005"] },
    { id: "USER003", email: "operator2@oorja.com", status: "locked", firstLoginAt: "2024-03-10T09:00:00Z", devicesAssigned: ["DEV006"] },
    { id: "USER004", email: "test.user@oorja.com", status: "active", firstLoginAt: "2024-07-20T14:00:00Z", devicesAssigned: [] },
  ];
  return z.array(userSchema).parse(data);
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">User Management</h1>
          <p className="text-muted-foreground">
            Manage operators and their assigned devices.
          </p>
        </div>
        <Dialog>
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
                <UserForm />
            </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
