import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BiomarkerTableCell } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-cell';
import { BiomarkerTableDialogRow } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-dialog-row';
import { BiomarkerTableRow } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-row';
import { BiomarkerDataTableToolbar } from '@/features/biomarkers/components/toolbar/biomarker-data-table-toolbar';
import { ToolbarCategoryType } from '@/features/biomarkers/types/filters';
import { getHealthcareServiceFromCategory } from '@/features/biomarkers/utils/get-healthcare-service-from-category';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useServices } from '@/features/services/api/get-services';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  disableToolbar?: boolean;
  disableHeader?: boolean;
  cellClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  columnFilters = [],
  columnVisibility,
  disableToolbar = false,
  disableHeader = false,
  cellClassName = '',
}: DataTableProps<TData, TValue>): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, onColumnFiltersChange] =
    useState<ColumnFiltersState>(columnFilters);
  const { width } = useWindowDimensions();

  const visibility = columnVisibility
    ? columnVisibility
    : {
        category: false,
        status: width > 1280,
        range: width > 1024,
        value: width > 1024,
      };

  const healthcareServices = useServices({});

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

  const [currentCategory, setCurrentCategory] =
    useState<ToolbarCategoryType>('Blood');

  const healthcareService = healthcareServices?.data?.services.find(
    (service) =>
      service.name === getHealthcareServiceFromCategory(currentCategory),
  );

  const getTabContent = () => {
    switch (currentCategory) {
      case 'Blood':
        return (
          <Table className="border-separate border-spacing-y-3">
            {!disableHeader ? (
              table.getRowModel().rows.length > 0 ? (
                <TableHeader
                  className={cn(
                    disableHeader ? 'hidden' : 'hidden md:table-header-group',
                  )}
                >
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      className="hover:bg-transparent"
                      key={headerGroup.id}
                    >
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className="h-2 text-nowrap"
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
              ) : (
                <div className="text-center text-base text-slate-400">
                  No data based on the current filters you selected.
                </div>
              )
            ) : null}
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <BiomarkerTableDialogRow
                  biomarker={row.original as Biomarker}
                  key={row.id}
                >
                  <BiomarkerTableRow>
                    {row.getVisibleCells().map((cell) => (
                      <BiomarkerTableCell
                        key={cell.id}
                        className={cellClassName}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </BiomarkerTableCell>
                    ))}
                  </BiomarkerTableRow>
                </BiomarkerTableDialogRow>
              ))}
            </TableBody>
          </Table>
        );
      default:
        return (
          <div className="w-full rounded-3xl bg-white px-8 py-16 text-center">
            <div className="text-xl">
              Looks like we don&apos;t have your {currentCategory} data.
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-3 pt-12">
              {healthcareService && (
                <HealthcareServiceDialog healthcareService={healthcareService}>
                  <Button variant="default" className="w-full max-w-[400px]">
                    Get Tested
                  </Button>
                </HealthcareServiceDialog>
              )}
              <Link to="/vault" className="w-full max-w-[400px]">
                <Button variant="outline" className="w-full">
                  Upload Lab Report
                </Button>
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {!disableToolbar ? (
        <div>
          <BiomarkerDataTableToolbar
            table={table}
            setCurrentCategory={setCurrentCategory}
            currentCategory={currentCategory}
          />
        </div>
      ) : null}
      {getTabContent()}
      {loading ? <ResultsLoading loading={loading} /> : null}
    </div>
  );
}

function ResultsLoading({ loading }: { loading: boolean }): JSX.Element {
  return (
    <div className="flex h-24 items-center justify-center text-center text-gray-400">
      {loading ? <Spinner /> : <span>No results available.</span>}
    </div>
  );
}
