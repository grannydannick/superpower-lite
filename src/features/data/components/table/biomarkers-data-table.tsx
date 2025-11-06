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
import { ChevronDown } from 'lucide-react';
import {
  memo,
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
import { selectResultForOrder } from '@/features/data/utils/select-result-for-order';
import { useOrders } from '@/features/orders/api';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

import { STATUS_TO_COLOR } from '../../../../const/status-to-color';
import { useDataFilterStore } from '../../stores/data-filter-store';

import { BiomarkerDataRow } from './biomarker-data-row';
import { BiomarkerSkeletonRow } from './biomarker-skeleton-row';

const BiomarkersTableBodyContent = ({
  rows,
  visibleRows,
  isFiltering,
  isLoading,
  skeletonColSpan,
  screenSize,
  selectedOrderId,
  selectedOrderDate,
}: {
  rows: Row<Biomarker>[];
  visibleRows: Row<Biomarker>[];
  isFiltering: boolean;
  isLoading?: boolean;
  skeletonColSpan: number;
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'widescreen';
  selectedOrderId?: string;
  selectedOrderDate?: Date | null;
}) => {
  if (isFiltering || isLoading) {
    if (visibleRows.length > 0) {
      return (
        <>
          {visibleRows.map((row) => (
            <TableRow
              key={`skeleton-${row.id}`}
              className="border-none bg-transparent shadow-none outline-none hover:bg-transparent"
            >
              <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                <BiomarkerSkeletonRow />
              </TableCell>
            </TableRow>
          ))}
        </>
      );
    }

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
          selectedOrderId={selectedOrderId}
          selectedOrderDate={selectedOrderDate}
        />
      ))}
    </>
  );
};

const LazySparklineChart = memo(function LazySparklineChart({
  biomarker,
}: {
  biomarker: Biomarker;
}) {
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
});

const getColumns = (
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'widescreen' = 'desktop',
  hiddenColumns: string[] = [],
  selectedOrderId?: string,
  selectedOrderDate?: Date | null,
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
              'transition-transform duration-200 size-4',
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
              'transition-transform duration-200 size-4',
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
        const currentValue =
          selectResultForOrder(biomarker, selectedOrderId, selectedOrderDate) ||
          biomarker.value?.[0];

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

const BiomarkersDataTableComponent = ({
  biomarkers,
  hideHeader = false,
  hiddenColumns = [],
  isLoading,
}: {
  biomarkers: Biomarker[];
  hideHeader?: boolean;
  hiddenColumns?: string[];
  isLoading?: boolean;
}) => {
  const [isFiltering, setIsFiltering] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // responsive handler
  const { width } = useWindowDimensions();
  const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' | 'widescreen' => {
    if (width < 1024) return 'mobile';
    if (width < 1280) return 'tablet';
    if (width <= 1600) return 'desktop';
    return 'widescreen';
  };
  const screenSize = getScreenSize();

  const { selectedOrderId } = useDataFilterStore();
  const { data: orders } = useOrders();

  const selectedOrderDate = useMemo(() => {
    if (!selectedOrderId || !orders) return null;
    const order = orders.orders.find((o) => o.id === selectedOrderId);
    return order?.endTimestamp ? new Date(order.endTimestamp) : null;
  }, [orders, selectedOrderId]);

  const columns = useMemo(
    () =>
      getColumns(screenSize, hiddenColumns, selectedOrderId, selectedOrderDate),
    [screenSize, hiddenColumns, selectedOrderId, selectedOrderDate],
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

  const rows = table.getRowModel().rows;
  const skeletonColSpan = table.getVisibleLeafColumns().length || 1;
  const visibleRows = rows.filter(
    (r) => r.original.status !== 'PENDING' && r.original.status !== 'UNKNOWN',
  );

  return (
    <div
      className={cn('overflow-x-auto', screenSize === 'mobile' && 'w-full')}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}
    >
      <Table
        className={cn(
          'border-separate',
          screenSize === 'mobile'
            ? 'border-spacing-y-1 border-spacing-x-0'
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
                    'font-medium text-zinc-400 mt-5',
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
            rows={rows}
            visibleRows={visibleRows}
            isFiltering={isFiltering}
            isLoading={isLoading}
            skeletonColSpan={skeletonColSpan}
            screenSize={screenSize}
            selectedOrderId={selectedOrderId}
            selectedOrderDate={selectedOrderDate}
          />
        </TableBody>
      </Table>
    </div>
  );
};

export const BiomarkersDataTable = memo(BiomarkersDataTableComponent);
BiomarkersDataTable.displayName = 'BiomarkersDataTable';
