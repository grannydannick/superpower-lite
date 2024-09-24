import { ColumnDef } from '@tanstack/react-table';

import { Rdn } from '@/types/api';

export const columns: ColumnDef<Rdn>[] = [
  {
    accessorKey: 'firstName',
    header: 'First name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last name',
  },
  {
    accessorKey: 'npi',
    header: 'NPI',
  },
  {
    accessorKey: 'licensed',
    header: 'Licensed',
    cell: ({ row }) => {
      return row.original.licensed.join(', ');
    },
  },
  {
    accessorKey: 'schedulingLink',
    header: 'Scheduling link',
    cell: ({ row }) => {
      return (
        <a href={row.original.schedulingLink} className="text-orange-600">
          {row.original.schedulingLink}
        </a>
      );
    },
  },
];
