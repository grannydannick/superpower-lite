import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, MoreVertical } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { MenuDropdown } from '@/features/settings/components/wearables/menu-dropdown';
import { Wearable } from '@/types/api';
import { capitalize } from '@/utils/format';

export const columns: ColumnDef<Wearable>[] = [
  {
    accessorKey: 'provider',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Integration
          <ChevronDown
            className={`ml-0.5 size-4 transition-transform duration-300 ease-in-out${
              column.getIsSorted() === 'asc' ? 'rotate-180' : ''
            }`}
          />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-2 md:max-w-[280px] lg:max-w-[400px]">
          <img
            src={row.original.logo}
            alt={row.original.provider}
            className="size-5"
          />
          {row.original.provider}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => {
      return <div className="text-nowrap">Status</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-row items-center gap-x-2 text-zinc-400">
          <div className="size-1.5 rounded-full bg-[#34D399]" />
          {capitalize(row.original.status.toLowerCase())}
        </div>
      );
    },
  },
  {
    id: 'action',
    header: () => {
      return <div className="text-right"></div>;
    },
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <MenuDropdown wearable={row.original}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="size-4 text-zinc-400 data-[state=open]:bg-muted" />
              <span className="sr-only">Open menu</span>
            </Button>
          </MenuDropdown>
        </div>
      );
    },
  },
];
