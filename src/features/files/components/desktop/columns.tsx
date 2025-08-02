import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, MoreVertical } from 'lucide-react';
import moment from 'moment';
import React from 'react';

import { Button } from '@/components/ui/button';
import { ViewPdfDialog } from '@/features/files/components/view-pdf-dialog';
import { cn } from '@/lib/utils';
import { File } from '@/types/api';

import { ContentType } from '../content-type';
// import { SourceLabel, CategoryLabel, StatusLabel } from '../file-labels';
import { FileName } from '../file-name';
import { MenuDropdown } from '../menu-dropdown';

// TODO: Enable source, category, and status columns
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
      if (row.original.contentType === 'application/pdf') {
        return (
          <ViewPdfDialog file={row.original}>
            <div className="flex w-auto cursor-pointer items-center place-self-start md:max-w-[280px] lg:max-w-[400px]">
              <FileName file={row.original} />
            </div>
          </ViewPdfDialog>
        );
      }

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
  // {
  //   accessorKey: 'source',
  //   meta: {
  //     tooltip:
  //       'Indicates whether this is a file you uploaded or a file from Superpower, like your blood panel summary.',
  //   },
  //   header: 'Source',
  //   cell: ({ row }) => {
  //     return (
  //       <div className="hidden lg:table-cell">
  //         <SourceLabel source={row.original.source} />
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: 'category',
  //   meta: {
  //     tooltip:
  //       "We categorize your health records to extract useful information. Currently, blood panels are fully supported, and we'll process other documents as we expand our capabilities.",
  //   },
  //   header: 'Category',
  //   cell: ({ row }) => {
  //     return (
  //       <div className="hidden lg:table-cell">
  //         <CategoryLabel category={row.original.category} />
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: 'status',
  //   meta: {
  //     tooltip:
  //       'Indicates where the file is in our processing workflow. We will notify you when the status changes, typically within 72 hours.',
  //   },
  //   header: () => {
  //     return <div className="text-nowrap">Status</div>;
  //   },
  //   cell: ({ row }) => {
  //     return (
  //       <div className="text-zinc-500">
  //         <StatusLabel status={row.original.processingStatus} />
  //       </div>
  //     );
  //   },
  // },
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
