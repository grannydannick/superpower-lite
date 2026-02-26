import { useQueryClient } from '@tanstack/react-query';
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getWearablesQueryOptions } from '@/features/settings/api';
import { VitalLinkButton } from '@/features/settings/components/vital-button';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const queryClient = useQueryClient();
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
    <div className="space-y-8">
      <Card>
        <div className="flex flex-row items-center justify-between gap-4 p-12">
          <div>
            <h3 className="text-base text-primary lg:text-xl">
              Connect another wearable
            </h3>
          </div>
          <div className="flex flex-row items-center space-x-6">
            <VitalLinkButton
              callback={() =>
                queryClient.invalidateQueries({
                  queryKey: getWearablesQueryOptions().queryKey,
                })
              }
            >
              Connect
            </VitalLinkButton>
          </div>
        </div>
      </Card>
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="text-base hover:bg-transparent [&>*:first-child]:pl-12 [&>*:last-child]:pr-12"
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group p-6 text-base text-zinc-500 [&>*:first-child]:pl-12 [&>*:last-child]:pr-12"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <></>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
