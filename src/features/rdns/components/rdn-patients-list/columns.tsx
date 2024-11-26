import { ColumnDef } from '@tanstack/react-table';

import { ActionCell } from '@/features/rdns/components/rdn-patients-list/action-cell';
import { User } from '@/types/api';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return `${row.original.firstName} ${row.original.lastName}`;
    },
  },
  {
    // Filter only
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return <ActionCell patient={row.original} />;
    },
  },
];
