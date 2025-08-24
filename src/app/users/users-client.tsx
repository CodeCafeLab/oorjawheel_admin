
"use client";

import { z } from "zod";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { User, userSchema } from "./schema";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users as UsersIcon } from "lucide-react";
import { UserForm } from "./user-form";
import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleFormSuccess = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleAddClick = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  // Fetch users (similar to refreshData)
  const refreshUsers = async () => {
    // setLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiBase}/users`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const usersJson = await res.json();
      const parsedUsers = z.array(userSchema).parse(
        (Array.isArray(usersJson) ? usersJson : usersJson.data ?? []).map(
          (u: any) => ({
            id: u.id.toString(),
            name: u.name,
            email: u.email,
            // ...map other fields as needed...
          })
        )
      );
      setUsers(parsedUsers);
    } catch (error) {
      // toast({
      //   variant: "destructive",
      //   title: "Error",
      //   description: "Failed to refresh or validate user data.",
      // });
    } finally {
      // setLoading(false);
    }
  };

  // Add user
  const handleAddUser = async (data: User) => {
    // setLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiBase}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          // ...other fields as needed...
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add user");
      // toast({ title: "User Added", description: result.message });
      refreshUsers();
      setOpen(false);
    } catch (e: any) {
      // toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      // setLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (id: string, data: User) => {
    // setLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiBase}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          // ...other fields as needed...
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update user");
      // toast({ title: "User Updated", description: result.message });
      refreshUsers();
      setOpen(false);
    } catch (e: any) {
      // toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      // setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id: string) => {
    // setLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiBase}/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete user");
      // toast({ title: "User Deleted", description: result.message });
      refreshUsers();
    } catch (e: any) {
      // toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
        <Card>
          <CardContent className="p-4 sm:p-6">
            <DataTable columns={columns(handleEditClick)} data={users} />
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20 border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardHeader className="text-center p-0">
                <CardTitle className="text-xl font-headline">
                No Users Found
                </CardTitle>
                <CardDescription>
                Get started by creating the first user account.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-6">
                <Button size="lg" onClick={handleAddClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First User
                </Button>
            </CardContent>
        </Card>
      )}

      <Sheet
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setSelectedUser(null);
        }}
      >
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-headline text-2xl">
              {selectedUser ? "Edit User" : "Add New User"}
            </SheetTitle>
            <SheetDescription>
              {selectedUser
                ? "Update the details for this user."
                : "Fill in the details to create a new user account."}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="px-1 py-6">
              <UserForm onFormSuccess={handleFormSuccess} user={selectedUser} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
