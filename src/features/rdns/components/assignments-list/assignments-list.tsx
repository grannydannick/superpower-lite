import { Spinner } from '@/components/ui/spinner';
import { columns } from '@/features/rdns/components/assignments-list/columns';
import { AssignmentsDataTable } from '@/features/rdns/components/assignments-list/data-table';
import { useUsers } from '@/features/users/api';

export const AssignmentsList = () => {
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
      <AssignmentsDataTable columns={columns} data={usersQuery.data.users} />
    </div>
  );
};
