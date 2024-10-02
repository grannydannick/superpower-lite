import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BiomarkerTableDialogRow } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-dialog-row';
import CategoryFilter from '@/features/biomarkers/components/toolbar/category-filter';
import SearchBar from '@/features/biomarkers/components/toolbar/searchbar';
import StatusFilter from '@/features/biomarkers/components/toolbar/status-filter';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, onColumnFiltersChange] = useState<ColumnFiltersState>([]);

  const visibility = {
    category: false,
    status: false,
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters: filters,
      columnVisibility: visibility,
    },
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: onColumnFiltersChange,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  //The virtualizer needs to know the scrollable container element
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <div
      className="sticky top-28 hidden h-[664px] max-w-[728px] overflow-y-auto rounded-3xl bg-white px-12 pb-12 lg:block"
      ref={tableContainerRef}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white pb-6 pt-12">
        <SearchBar table={table} />
        <div className="flex items-center gap-3">
          <StatusFilter table={table} />
          <CategoryFilter table={table} />
        </div>
      </div>
      <Table className="grid">
        <TableHeader className="grid [&_tr]:border-b-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="flex w-full bg-white hover:bg-white"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="flex h-auto px-0 pb-4"
                    style={{ width: header.getSize() }}
                  >
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
        <TableBody
          className="relative grid"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<Biomarker>;

            return (
              <BiomarkerTableDialogRow
                biomarker={row.original as Biomarker}
                key={row.id}
              >
                <TableRow
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                  key={row.id}
                  className="absolute flex w-full border-b-0 bg-white pb-3 hover:bg-white [&>*:first-child]:rounded-l-[12px] [&>*:first-child]:pl-3 [&>*:last-child]:rounded-r-[12px] [&>*:last-child]:pr-3"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                  }}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'flex items-center bg-zinc-50 px-0 py-2',
                        index === row.getVisibleCells().length - 1 &&
                          'justify-end', // Conditionally add 'justify-end'
                      )}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </BiomarkerTableDialogRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
