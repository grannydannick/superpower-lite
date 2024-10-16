import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';

import { Body1, Body2 } from '@/components/ui/typography';
import { ActionCell } from '@/features/rdns/components/upcoming-calls-list/action-cell';
import { OrderWithUserInfo } from '@/types/api';

export const columns: ColumnDef<OrderWithUserInfo>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div>
          <Body1>
            {row.original.firstName} {row.original.lastName}
          </Body1>
        </div>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = moment(row.original.timestamp);

      return (
        <div>
          <Body1>{date.format('MMM Do h:mma')}</Body1>
        </div>
      );
    },
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
    cell: ({ row }) => <ActionCell order={row.original} />,
  },
];
