import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      desc: true,
      id: 'uploadedAt',
    },
  ]);
  const { width } = useWindowDimensions();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnVisibility: {
        contentType: width > 1280,
        status: width > 1280,
        updatedAt: width > 475,
      },
    },
  });

  return (
    <Card className="hidden pb-4 md:block">
      <Table className="duration-500 animate-in fade-in">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="text-sm hover:bg-transparent [&>*:first-child]:pl-12 [&>*:last-child]:pr-12"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="[&_tr:first-child_td]:pt-6">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <React.Fragment key={row.id}>
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  className="group relative rounded-lg border-none p-6 text-base after:absolute after:inset-x-4 after:bottom-0 after:z-0 after:h-14 after:rounded-xl after:opacity-0 after:transition-colors after:duration-500 after:ease-out after:content-[''] hover:bg-transparent hover:after:bg-zinc-100 hover:after:opacity-100 [&>*:first-child]:pl-12 [&>*:last-child]:pr-12"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="relative z-10">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {index !== table.getRowModel().rows.length - 1 && (
                  <div className="my-2 w-full px-12">
                    <div className="absolute left-1/2 -mt-1 h-px w-[calc(100%-2rem)] -translate-x-1/2 bg-zinc-100" />
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <></>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
