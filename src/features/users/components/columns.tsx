import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { useLogin } from '@/lib/auth';
import { User } from '@/types/api';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'firstName',
    header: 'First name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last name',
  },
  {
    accessorKey: 'dateOfBirth',
    header: 'Date of birth',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  // {
  //   accessorKey: '_count.observations',
  //   header: 'Biomarker #',
  // },
  // {
  //   accessorKey: '_count.serviceRequests',
  //   header: 'Services #',
  // },
  {
    accessorKey: 'createdAt',
    header: 'Created',
  },
  {
    id: 'login',
    cell: function CellComponent({ row }) {
      const loginMutation = useLogin({});

      const userEmail = row.original.email;
      return (
        <Button
          onClick={async () =>
            loginMutation.mutateAsync({
              email: userEmail,
              password: '',
              authMethod: 'admin',
            })
          }
        >
          Sign in as User
        </Button>
      );
    },
  },
];
