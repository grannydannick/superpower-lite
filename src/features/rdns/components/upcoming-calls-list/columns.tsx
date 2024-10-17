import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import moment from 'moment';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Body1, Body2 } from '@/components/ui/typography';
import { ActionCell } from '@/features/rdns/components/upcoming-calls-list/action-cell';
import { cn } from '@/lib/utils';
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
    accessorKey: 'timestamp',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-sm hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ChevronDown
            className={cn(
              `ml-0.5 size-4 transition-transform duration-300 ease-in-out`,
              column.getIsSorted() === 'asc' ? 'rotate-180' : '',
            )}
          />
        </Button>
      );
    },
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
