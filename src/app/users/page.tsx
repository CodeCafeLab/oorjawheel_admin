
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
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const refreshData = async () => {
    const fetchedUsers = await fetchUsers();
    setUsers(fetchedUsers);
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (!isClient) {
    return null;
  }
  
  return <UsersClient initialUsers={users} onDataRefresh={refreshData} />;
}
