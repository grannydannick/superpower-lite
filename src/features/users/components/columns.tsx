import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { useLogin } from '@/lib/auth';
import { AdminUser } from '@/types/api';

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
    id: 'login',
    cell: function CellComponent({ row }) {
      const loginMutation = useLogin({});
      const queryClient = useQueryClient();

      const userEmail = row.original.email;
      return (
        <Button
          onClick={async () => {
            await loginMutation.mutateAsync({
              email: userEmail,
              password: '',
              authMethod: 'admin',
            });

            // needed to remove all previous user queries and refetch for the new one
            queryClient.removeQueries();
          }}
        >
          Sign in as User
        </Button>
      );
    },
  },
];
