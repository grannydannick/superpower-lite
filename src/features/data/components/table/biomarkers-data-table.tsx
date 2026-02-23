import type { OnChangeFn } from '@tanstack/react-table';
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, Lock } from 'lucide-react';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { InView } from 'react-intersection-observer';

import { Button } from '@/components/ui/button';
import { SparklineChart } from '@/components/ui/charts/sparkline-chart/sparkline-chart';
import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { useScreenSize } from '@/features/data/hooks/use-screen-size';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

import { STATUS_TO_COLOR } from '../../../../const/status-to-color';

import { BiomarkerDataRow } from './biomarker-data-row';
import { BiomarkerSkeletonRow } from './biomarker-skeleton-row';

function BiomarkersTableBodyContent({
  rows,
  isFiltering,
  isLoading,
  skeletonColSpan,
  screenSize,
  hideDialog = false,
}: {
  rows: Row<Biomarker>[];
  isFiltering: boolean;
  isLoading?: boolean;
  skeletonColSpan: number;
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'widescreen';
  hideDialog?: boolean;
}) {
  if (isFiltering || isLoading) {
    return (
      <>
        {Array.from({ length: 8 }).map((_, idx) => (
          <TableRow
            key={`skeleton-empty-${idx}`}
            className="border-none bg-transparent shadow-none outline-none hover:bg-transparent"
          >
            <TableCell colSpan={skeletonColSpan} className="p-0">
              <BiomarkerSkeletonRow />
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <>
      {rows.map((row) => (
        <BiomarkerDataRow
          key={row.id}
          row={row}
          screenSize={screenSize}
          hideDialog={hideDialog}
        />
      ))}
    </>
  );
}

function LazySparklineChart({ biomarker }: { biomarker: Biomarker }) {
  return (
    <InView triggerOnce rootMargin="200px">
      {({ ref, inView }) => (
        <div ref={ref} className="-ml-8 md:ml-0">
          {inView ? (
            <SparklineChart biomarker={biomarker} />
          ) : (
            <div className="h-16" />
          )}
        </div>
      )}
    </InView>
  );
}

const getColumns = (
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'widescreen' = 'desktop',
  hiddenColumns: string[] = [],
): ColumnDef<Biomarker>[] => {
  const isDesktop = screenSize === 'desktop' || screenSize === 'widescreen';
  const allColumns = [
    {
      accessorKey: 'name',
      size: 200,
      header: ({ column }: { column: Column<Biomarker, unknown> }) => (
        <Button
          variant="ghost"
          className="gap-2 p-0 text-sm text-zinc-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-200',
              column.getIsSorted() === 'asc' ? 'rotate-180' : null,
            )}
          />
        </Button>
      ),
      cell: ({ row }: { row: Row<Biomarker> }) => {
        const name: string = row.getValue('name');

        return (
          <div className="flex items-center gap-2.5 pl-2 md:pl-0">
            <Body1 className={cn('line-clamp-2', !isDesktop && 'text-sm')}>
              {name}
            </Body1>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      size: 120,
      header: ({ column }: { column: Column<Biomarker, unknown> }) => (
        <Button
          variant="ghost"
          className="gap-2 p-0 text-sm text-zinc-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-200',
              column.getIsSorted() === 'desc' && 'rotate-180',
            )}
          />
        </Button>
      ),
      cell: ({ row }: { row: Row<Biomarker> }) => {
        const biomarker = row.original;
        const statusColor =
          STATUS_TO_COLOR[
            biomarker.status.toLowerCase() as keyof typeof STATUS_TO_COLOR
          ] || STATUS_TO_COLOR.pending;

        if (row.original.status === 'RECOMMENDED')
          return (
            <Body2
              className={cn(
                'whitespace-nowrap text-zinc-500',
                !isDesktop && 'text-sm',
              )}
            >
              Unlock this insight
            </Body2>
          );

        return (
          <div className="flex items-center gap-2">
            <div
              style={{
                backgroundColor: statusColor,
              }}
              className="-mt-0.5 flex size-1.5 items-center gap-2 rounded-full"
            />
            <Body2
              style={{
                color: statusColor,
              }}
              className={cn('capitalize', !isDesktop && 'text-sm')}
            >
              {biomarker.status.toLowerCase()}
            </Body2>
          </div>
        );
      },
    },
    {
      accessorKey: 'value',
      size: 120,
      header: () => <span className="text-sm text-zinc-400">Value</span>,
      cell: ({ row }: { row: Row<Biomarker> }) => {
        const biomarker = row.original;
        // should always return latest because we sort on backend
        const currentValue = biomarker.value?.[0];

        const formatCurrentValue = () => {
          if (!currentValue?.quantity) return 'No value';

          const { value, unit } = currentValue.quantity;
          const displayUnit = unit || biomarker.unit;

          return (
            <span>
              <span className="text-black">{value}</span>{' '}
              <span className="text-zinc-500">{displayUnit}</span>
            </span>
          );
        };

        if (row.original.status === 'RECOMMENDED') return null;

        return (
          <Body2 className={cn('text-zinc-600', !isDesktop && 'text-sm')}>
            {formatCurrentValue()}
          </Body2>
        );
      },
    },
    {
      accessorKey: 'optimalRange',
      size: 140,
      header: () => (
        <span className="text-sm text-zinc-400">Optimal Range</span>
      ),
      cell: ({ row }: { row: Row<Biomarker> }) => {
        const { ranges } = getBiomarkerRanges(row.original);
        const optimalRange = ranges.find((r) => r.status === 'OPTIMAL');

        const formatRange = () => {
          if (!optimalRange) return 'No optimal range';

          const { low, high } = optimalRange;

          if (low && high) {
            return `${low.value} - ${high.value}`;
          } else if (low) {
            return `≥ ${low.value}`;
          } else if (high) {
            return `≤ ${high.value}`;
          }

          return 'Range not specified';
        };

        if (row.original.status === 'RECOMMENDED') return null;

        return (
          <Body2
            className={cn(
              'text-zinc-400',
              screenSize === 'mobile' && 'text-xs',
            )}
          >
            {formatRange()}
          </Body2>
        );
      },
    },
    {
      accessorKey: 'history',
      size: 180,
      header: () => (
        <span className="text-sm text-zinc-400 md:ml-8">History</span>
      ),
      cell: ({ row }: { row: Row<Biomarker> }) => {
        const biomarker = row.original;

        if (row.original.status === 'RECOMMENDED') {
          return (
            <div className="flex w-full items-end">
              <Button
                size="small"
                variant="outline"
                className="ml-auto items-center gap-1 bg-white"
              >
                <Lock className="size-4 text-zinc-400" />
                Unlock
              </Button>
            </div>
          );
        }

        if (biomarker.status === 'PENDING' || biomarker.status === 'UNKNOWN') {
          return <div className="h-16" />;
        }

        return <LazySparklineChart biomarker={biomarker} />;
      },
    },
  ];

  let filteredColumns = allColumns;

  if (screenSize === 'mobile') {
    filteredColumns = allColumns.filter(
      (column) =>
        column.accessorKey === 'name' ||
        column.accessorKey === 'status' ||
        column.accessorKey === 'history',
    );
  } else if (screenSize === 'tablet') {
    filteredColumns = allColumns.filter(
      (column) =>
        column.accessorKey === 'name' ||
        column.accessorKey === 'status' ||
        column.accessorKey === 'value' ||
        column.accessorKey === 'history',
    );
  } else if (screenSize === 'desktop') {
    // On standard desktop, hide Optimal Range (only show on >1600px)
    filteredColumns = allColumns.filter(
      (column) => column.accessorKey !== 'optimalRange',
    );
  }

  return filteredColumns.filter(
    (column) => !hiddenColumns.includes(column.accessorKey),
  );
};

const EMPTY_HIDDEN_COLUMNS: string[] = [];

export function BiomarkersDataTable({
  biomarkers,
  hideHeader = false,
  hiddenColumns = EMPTY_HIDDEN_COLUMNS,
  displayPending = false,
  isLoading,
  hideDialog = false,
}: {
  biomarkers: Biomarker[];
  hideHeader?: boolean;
  hiddenColumns?: string[];
  isLoading?: boolean;
  displayPending?: boolean;
  hideDialog?: boolean;
}) {
  'use no memo';

  const [isFiltering, setIsFiltering] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // responsive handler using media-query backed hook to avoid frequent re-renders
  const screenSize = useScreenSize();

  const columns = useMemo(
    () => getColumns(screenSize, hiddenColumns),
    [screenSize, hiddenColumns],
  );

  /**
   * Callback to handle column filter changes
   */
  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updaterOrValue) => {
      setColumnFilters(
        updaterOrValue as React.SetStateAction<ColumnFiltersState>,
      );
    },
    [],
  );

  /**
   * Callback to handle sorting changes
   */
  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      setSorting(updaterOrValue as React.SetStateAction<SortingState>);
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

  const deferredBiomarkers = useDeferredValue(biomarkers);

  /**
   * Trigger skeletons while the deferred value lags the latest input
   * (indicates an in-flight transition from filter/search changes).
   */
  useEffect(() => {
    if (biomarkers !== deferredBiomarkers) {
      setIsFiltering(true);
    }
  }, [biomarkers, deferredBiomarkers]);

  const table = useReactTable({
    data: deferredBiomarkers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: handleColumnFiltersChange,
    onSortingChange: handleSortingChange,
    state: {
      columnFilters,
      sorting,
    },
  });

  const rows = table.getRowModel().rows;
  const skeletonColSpan = table.getVisibleLeafColumns().length || 1;
  const filteredRows = displayPending
    ? rows
    : rows.filter(
        (r) =>
          r.original.status !== 'PENDING' && r.original.status !== 'UNKNOWN',
      );

  // sort rows to place RECOMMENDED first, then others
  const visibleRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const aIsRecommended = a.original.status === 'RECOMMENDED';
      const bIsRecommended = b.original.status === 'RECOMMENDED';

      if (aIsRecommended && !bIsRecommended) return -1;
      if (!aIsRecommended && bIsRecommended) return 1;
      return 0;
    });
  }, [filteredRows]);

  if (biomarkers.length === 0 && !isFiltering && !isLoading) {
    return (
      <div className="py-16 text-center text-zinc-400">
        <H4 className="mb-2">No markers found</H4>
        <Body1 className="text-zinc-500">
          There are no markers matching your search.
          <br /> Try a different term instead.
        </Body1>
      </div>
    );
  }

  return (
    <div
      className={cn('overflow-x-auto', screenSize === 'mobile' && 'w-full')}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}
    >
      <Table
        className={cn(
          'border-separate',
          screenSize === 'mobile'
            ? 'border-spacing-x-0 border-spacing-y-1'
            : 'border-spacing-y-2',
        )}
        style={{
          tableLayout:
            screenSize === 'desktop' || screenSize === 'widescreen'
              ? 'fixed'
              : 'auto',
          width: '100%',
          minWidth:
            screenSize === 'desktop' || screenSize === 'widescreen'
              ? '100%'
              : '320px',
        }}
      >
        {!hideHeader && (
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-none hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  const isDesktop =
                    screenSize === 'desktop' || screenSize === 'widescreen';
                  const headWidth = isDesktop ? header.getSize() : 'auto';
                  const headMinWidth = !isDesktop
                    ? header.column.id === 'history'
                      ? '80px'
                      : '60px'
                    : 'auto';
                  const headerTextClass = cn(
                    'mt-5 font-medium text-zinc-400',
                    screenSize === 'mobile' && 'text-xs',
                  );

                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: headWidth, minWidth: headMinWidth }}
                      className={cn(screenSize === 'mobile' && 'px-1')}
                    >
                      <Body2 className={headerTextClass}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </Body2>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
        )}
        <TableBody
          className={cn(
            screenSize === 'mobile' ? 'border-spacing-2' : 'border-spacing-8',
          )}
        >
          <BiomarkersTableBodyContent
            rows={visibleRows}
            isFiltering={isFiltering}
            isLoading={isLoading}
            skeletonColSpan={skeletonColSpan}
            screenSize={screenSize}
            hideDialog={hideDialog}
          />
        </TableBody>
      </Table>
    </div>
  );
}
