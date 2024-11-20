import { ColumnDef } from '@tanstack/react-table';
import { differenceInYears, parseISO } from 'date-fns';

import { Body2 } from '@/components/ui/typography';
import { ActionCell } from '@/features/rdns/components/rdn-patients-list/action-cell';
import { User } from '@/types/api';
import { capitalize } from '@/utils/format';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const age = differenceInYears(
        new Date(),
        parseISO(row.original.dateOfBirth),
      );

      const gender = capitalize(row.original.gender.toLowerCase());
      return (
        <div>
          <Body2>
            {row.original.firstName} {row.original.lastName}
          </Body2>

          <Body2 className="text-zinc-400">
            {gender} - {row.original.dateOfBirth.split('T')[0]} ({age})
          </Body2>
        </div>
      );
    },
  },
  {
    // Filter only
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'actions',
    header: () => {
      return (
        <div className="flex w-full justify-end">
          <Body2 className="text-zinc-400">Actions</Body2>
        </div>
      );
    },
    cell: ({ row }) => <ActionCell patient={row.original} />,
  },
];
