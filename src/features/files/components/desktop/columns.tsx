import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, MoreVertical } from 'lucide-react';
import moment from 'moment';
import React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { File } from '@/types/api';
import { capitalize } from '@/utils/format';

import { ContentType } from '../content-type';
import { FileName } from '../file-name';
import { MenuDropdown } from '../menu-dropdown';

export const columns: ColumnDef<File>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          File
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
      return (
        <div className="flex items-center md:max-w-[280px] lg:max-w-[400px]">
          <FileName file={row.original} />
        </div>
      );
    },
  },
  {
    accessorKey: 'contentType',
    header: 'Type',
    cell: ({ row }) => {
      return (
        <div className="hidden xl:table-cell">
          <ContentType contentType={row.original.contentType} />
        </div>
      );
    },
  },
  {
    accessorKey: 'uploadedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Uploaded
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
      return <div>{moment(row.original.uploadedAt).format('MM/DD/YYYY')}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: () => {
      return <div className="text-nowrap">Status</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="text-zinc-500">
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
          <MenuDropdown file={row.original}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="size-4 text-zinc-500 data-[state=open]:bg-muted" />
              <span className="sr-only">Open menu</span>
            </Button>
          </MenuDropdown>
        </div>
      );
    },
  },
];
