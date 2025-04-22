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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

interface DataTableProps {
  columns: ColumnDef<Biomarker>[];
  data: Biomarker[];
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  disableToolbar?: boolean;
  disableHeader?: boolean;
  cellClassName?: string;
}

export function DataTable({
  columns,
  data,
  columnFilters = [],
  columnVisibility,
  disableToolbar = false,
  disableHeader = false,
  cellClassName = '',
}: DataTableProps): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, onColumnFiltersChange] =
    useState<ColumnFiltersState>(columnFilters);
  const [isFiltering, setIsFiltering] = useState(false);
  const { width } = useWindowDimensions();

  const visibility = columnVisibility
    ? columnVisibility
    : {
        category: false,
        orderId: false,
        status: width > 1280,
        range: width > 1024,
        value: width > 1024,
      };

  /**
   * Callback to handle column filter changes
   */
  const handleColumnFiltersChange = useCallback(
    (
      updater:
        | ColumnFiltersState
        | ((prev: ColumnFiltersState) => ColumnFiltersState),
    ) => {
      setIsFiltering(true);
      onColumnFiltersChange(updater);
    },
    [],
  );

  /**
   * This cleans up filtering set by handler above (handleColumnFiltersChange)
   */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isFiltering) {
      timer = setTimeout(() => {
        setIsFiltering(false);
      }, 600); // 600ms delay
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isFiltering]);

  const healthcareServices = useServices({});

  /**
   * Since we dont have any better way right now to get this data from server, we manually filter data array we get
   *
   * This is not too bad as we also optimize # of calls we make to server
   */
  const filteredData = useMemo(() => {
    const orderFilter = filters.find(
      (filter) => filter.id === 'orderId',
    )?.value;

    if (orderFilter) {
      return data
        .map((biomarker) => ({
          ...biomarker,
          value: biomarker.value.filter(
            (result) => result.orderId === orderFilter,
          ),
        }))
        .filter((biomarker) => biomarker.value.length > 0);
    }

    return data;
  }, [filters, data]);

  const table = useReactTable({
    data: filteredData,
    columns: isFiltering
      ? columns.map((column) => ({
          ...column,
          cell: () => <Skeleton className="h-[48px] w-full" />,
        }))
      : columns,
    state: {
      sorting,
      columnFilters: filters,
      columnVisibility: visibility,
    },
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: handleColumnFiltersChange,
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
        // 4/19/2025 - don't have a good way to filter DocumentReferences by service yet, so changing generic message here
        return (
          <div className="w-full rounded-3xl bg-white px-8 py-16 text-center">
            <div className="text-xl">
              Your {currentCategory} data lives in your{' '}
              <Link to="/vault" className="text-vermillion-900">
                Vault.
              </Link>
              <br />
              Haven&apos;t tested yet?
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-3 pt-4">
              {healthcareService && (
                <HealthcareServiceDialog
                  healthcareService={healthcareService}
                  // “force” React to re-create the entire provider (and its state) by passing a key prop that changes when the healthcareService changes
                  key={healthcareService.id}
                >
                  <Button variant="default" className="w-full max-w-[400px]">
                    Get Started
                  </Button>
                </HealthcareServiceDialog>
              )}
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
    </div>
  );
}
