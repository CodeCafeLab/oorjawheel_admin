
'use client';

import { fetchUsers } from '@/actions/users';
import { User } from './schema';
import { UsersClient } from './users-client';
import React, { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };
    loadUsers();
  }, []);

  return <UsersClient initialUsers={users} />;
}
