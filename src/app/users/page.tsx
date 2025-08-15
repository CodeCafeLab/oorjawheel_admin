
'use server';

import { fetchUsers } from '@/actions/users';
import { User } from './schema';
import { UsersClient } from './users-client';

export default async function UsersPage() {
  const users: User[] = await fetchUsers();

  return <UsersClient initialUsers={users} />;
}
