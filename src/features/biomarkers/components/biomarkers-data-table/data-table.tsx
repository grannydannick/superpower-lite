import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableHeader } from '@/components/ui/table';
import { BiomarkerTableCell } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-cell';
import { BiomarkerTableDialogRow } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-dialog-row';
import { BiomarkerTableHead } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-head';
import { BiomarkerTableHeaderRow } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-header-row';
import { BiomarkerTableRow } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-row';
import { BiomarkerDataTableToolbar } from '@/features/biomarkers/components/toolbar/biomarker-data-table-toolbar';
import { ToolbarCategoryType } from '@/features/biomarkers/const/toolbar-options';
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
  disableToolbar?: boolean;
  disableHeader?: boolean;
  groupByCategory?: boolean;
  cellClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  columnFilters = [],
  disableToolbar = false,
  disableHeader = false,
  groupByCategory = false,
  cellClassName = '',
}: DataTableProps<TData, TValue>): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, onColumnFiltersChange] =
    useState<ColumnFiltersState>(columnFilters);
  const healthcareServices = useServices({});
  const { width } = useWindowDimensions();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters: filters,
      columnVisibility: {
        category: false,
        status: width > 1280,
        range: width > 1024,
        value: width > 768,
      },
    },
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: onColumnFiltersChange,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  const categories = [
    ...new Set(
      table.getRowModel().rows.map((r) => (r.original as Biomarker).category),
    ),
  ];
  const [currentCategory, setCurrentCategory] =
    useState<ToolbarCategoryType>('Blood');
  const healthcareService = healthcareServices?.data?.services.find(
    (service) =>
      service.name === getHealthcareServiceFromCategory(currentCategory),
  );

  return (
    <>
      {!disableToolbar && (
        <div className="mb-20 mt-5">
          <BiomarkerDataTableToolbar
            table={table}
            setCurrentCategory={setCurrentCategory}
            currentCategory={currentCategory}
          />
        </div>
      )}

      {currentCategory === 'Blood' ? (
        <Table className={`border-separate border-spacing-y-3`}>
          {disableHeader ? (
            <></>
          ) : table.getRowModel().rows.length > 0 ? (
            <TableHeader className={cn(disableHeader ? 'hidden' : '')}>
              {table.getHeaderGroups().map((headerGroup) => (
                <BiomarkerTableHeaderRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <BiomarkerTableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </BiomarkerTableHead>
                    );
                  })}
                </BiomarkerTableHeaderRow>
              ))}
            </TableHeader>
          ) : (
            <div className="text-center text-base text-slate-400">
              No data based on the current filters you selected.
            </div>
          )}
          {groupByCategory ? (
            <>
              {categories.map((c: string): JSX.Element => {
                return (
                  <>
                    <h2
                      className={cn(
                        'text-3xl mt-6 [&>*:first-child]:mt-0 text-slate-400',
                      )}
                    >
                      {c}
                    </h2>
                    <TableBody>
                      {table
                        .getRowModel()
                        .rows.filter(
                          (r) => (r.original as Biomarker).category === c,
                        )
                        .map((row) => (
                          <BiomarkerTableRow key={row.id}>
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
                        ))}
                    </TableBody>
                  </>
                );
              })}
            </>
          ) : (
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
          )}
        </Table>
      ) : (
        <div className="w-full rounded-3xl bg-white py-16 text-center">
          <div className="text-xl">
            Looks like we don&apos;t have your {currentCategory} data.
          </div>
          <div className="space-x-8 pt-12">
            {healthcareService && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="mt-4">
                    Get Tested
                  </Button>
                </DialogTrigger>
                <HealthcareServiceDialog healthcareService={healthcareService}>
                  <Button onClick={() => {}}>Have you changed me?</Button>
                </HealthcareServiceDialog>
              </Dialog>
            )}
            <Link to="/settings/vault">
              <Button variant="outline" className="mt-4">
                Upload Lab Report
              </Button>
            </Link>
          </div>
        </div>
      )}
      {loading && <ResultsLoading loading={loading} />}
    </>
  );
}

function ResultsLoading({ loading }: { loading: boolean }): JSX.Element {
  return (
    <div className="flex h-24 items-center justify-center text-center text-gray-400">
      {loading ? <Spinner /> : <span>No results available.</span>}
    </div>
  );
}
