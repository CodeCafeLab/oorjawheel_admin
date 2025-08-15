
'use client';

import { fetchUsers } from '@/actions/users';
import { User } from './schema';
import { UsersClient } from './users-client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const refreshData = async () => {
    const fetchedUsers = await fetchUsers();
    setUsers(fetchedUsers);
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (users.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-20">
             <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">No Users Found</CardTitle>
                    <CardDescription>Get started by creating the first user account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UsersClient initialUsers={[]} onAddUser={() => setSheetOpen(true)} />
                </CardContent>
             </Card>
        </div>
    )
  }

  return <UsersClient initialUsers={users} onAddUser={() => setSheetOpen(true)} />;
}
