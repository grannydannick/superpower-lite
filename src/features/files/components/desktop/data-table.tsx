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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>): JSX.Element {
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
    <Card className="hidden md:block">
      <TooltipProvider>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="text-base hover:bg-transparent [&>*:first-child]:pl-12 [&>*:last-child]:pr-12"
              >
                {headerGroup.headers.map((header) => {
                  const tooltipContent = (
                    header.column.columnDef.meta as { tooltip?: string }
                  )?.tooltip;
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : tooltipContent ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative inline-block cursor-pointer">
                              <div>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px]">
                            {tooltipContent}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
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
      </TooltipProvider>
    </Card>
  );
}
