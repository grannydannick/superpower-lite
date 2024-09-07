import { Spinner } from '@/components/ui/spinner';
import { columns } from '@/features/users/components/columns';
import { UsersDataTable } from '@/features/users/components/data-table';

import { useUsers } from '../api';

export const UsersList = () => {
  const usersQuery = useUsers();

  if (usersQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!usersQuery.data) return null;

  return (
    <div className="py-10">
      <UsersDataTable columns={columns} data={usersQuery.data.users} />
    </div>
  );
};
