import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useImpersonateUser } from '@/lib/auth';
import { AdminUser } from '@/types/api';

import { DeleteUserModal } from './delete-user-modal';
import { ReactivateUserModal } from './reactivate-user-modal';
import { UpdateUserForm } from './update-user-form';

const ActionsCell = ({ user }: { user: AdminUser }) => {
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const isDeleted = user.isDeleted;

  return (
    <>
      <div className="flex gap-2 py-2">
        <Button
          variant="outline"
          onClick={() => setIsUpdateFormOpen(true)}
          disabled={isDeleted}
        >
          Edit
        </Button>
        {isDeleted ? (
          <Button onClick={() => setIsReactivateModalOpen(true)}>
            Reactivate
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        )}
      </div>
      <UpdateUserForm
        user={user}
        isOpen={isUpdateFormOpen}
        onClose={() => setIsUpdateFormOpen(false)}
      />
      <DeleteUserModal
        user={user}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
      <ReactivateUserModal
        user={user}
        isOpen={isReactivateModalOpen}
        onClose={() => setIsReactivateModalOpen(false)}
      />
    </>
  );
};

export const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: 'id',
    header: 'Identifier',
  },
  {
    accessorKey: 'firstName',
    header: 'First name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'dateOfBirth',
    header: 'Date of birth',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      return row.original.dateOfBirth.split('T')[0];
    },
  },
  {
    id: 'stripeCustomerId',
    header: 'Payment Method?',
    cell: ({ row }) => {
      return row.original.stripeCustomerId ? 'Y' : 'N';
    },
  },
  {
    id: 'observations',
    header: 'Biomarker #',
    cell: ({ row }) => {
      return row.original._count.observations;
    },
  },
  {
    id: 'serviceRequests',
    header: 'Service #',
    cell: ({ row }) => {
      return row.original._count.serviceRequests;
    },
  },
  {
    id: 'isDeleted',
    header: 'Status',
    cell: ({ row }) => {
      const isDeleted = row.original.isDeleted;
      return (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              isDeleted
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {isDeleted ? 'Deleted' : 'Active'}
          </span>
          {isDeleted && row.original.deletedAt && (
            <span className="text-xs text-gray-500">
              {new Date(row.original.deletedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
  {
    id: 'login',
    cell: function CellComponent({ row }) {
      const impersonateMutation = useImpersonateUser();

      return (
        <Button
          disabled={row.original.isDeleted}
          onClick={() =>
            impersonateMutation.mutate({ userId: row.original.id })
          }
        >
          Sign in as User
        </Button>
      );
    },
  },
];
