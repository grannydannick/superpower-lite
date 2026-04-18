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
import { ChevronDown, MessageSquareText } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { InView } from 'react-intersection-observer';

import { Button } from '@/components/ui/button';
import { CodedValueSparkline } from '@/components/ui/charts/coded-value-sparkline';
import { RangeSparkline } from '@/components/ui/charts/range-sparkline';
import { SparklineChart } from '@/components/ui/charts/sparkline-chart/sparkline-chart';
import {
  getBiomarkerRanges,
  getCodedBiomarkerRanges,
} from '@/components/ui/charts/utils/get-biomarker-ranges';
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
import type { Biomarker } from '@/types/api';
import { getDisplayComparator } from '@/utils/get-display-comparator';

import { STATUS_TO_COLOR } from '../../../../const/status-to-color';
import type { DataBiomarker, DataSummaryCategory } from '../../types/data-api';

import { BiomarkerDataRow } from './biomarker-data-row';
import { BiomarkerSkeletonRow } from './biomarker-skeleton-row';

function BiomarkersTableBodyContent({
  rows,
  isLoading,
  skeletonColSpan,
  screenSize,
  hideDialog = false,
  currentCategory,
}: {
  rows: Row<DataBiomarker>[];
  isLoading?: boolean;
  skeletonColSpan: number;
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'widescreen';
  hideDialog?: boolean;
  currentCategory?: DataSummaryCategory;
}) {
  if (isLoading) {
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
          currentCategory={currentCategory}
        />
      ))}
    </>
  );
}

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

const LazyCodedValueSparkline = memo(function LazyCodedValueSparkline({
  biomarker,
}: {
  biomarker: Biomarker;
}) {
  return (
    <InView triggerOnce rootMargin="200px">
      {({ ref, inView }) => (
        <div ref={ref} className="-ml-8 md:ml-0">
          {inView ? (
            <CodedValueSparkline biomarker={biomarker} />
          ) : (
            <div className="h-16" />
          )}
        </div>
      )}
    </InView>
  );
});

const LazyRangeSparkline = memo(function LazyRangeSparkline({
  biomarker,
}: {
  biomarker: Biomarker;
}) {
  return (
    <InView triggerOnce rootMargin="200px">
      {({ ref, inView }) => (
        <div ref={ref} className="-ml-8 md:ml-0">
          {inView ? (
            <RangeSparkline biomarker={biomarker} />
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
): ColumnDef<DataBiomarker>[] => {
  const isDesktop = screenSize === 'desktop' || screenSize === 'widescreen';
  const allColumns = [
    {
      accessorKey: 'title',
      size: 200,
      header: ({ column }: { column: Column<DataBiomarker, unknown> }) => (
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
      cell: ({ row }: { row: Row<DataBiomarker> }) => {
        const title: string = row.getValue('title');

        return (
          <div className="flex items-center gap-2.5 pl-2 md:pl-0">
            <Body1 className={cn('line-clamp-2', !isDesktop && 'text-sm')}>
              {title}
            </Body1>
          </div>
        );
      },
    },
    {
      id: 'status',
      accessorFn: (row: DataBiomarker) => row.observation?.status,
      sortUndefined: 'last' as const,
      size: 120,
      header: ({ column }: { column: Column<DataBiomarker, unknown> }) => (
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
      cell: ({ row }: { row: Row<DataBiomarker> }) => {
        const obs = row.original.observation;

        if (!obs)
          return (
            <Body2
              className={cn(
                'whitespace-nowrap text-zinc-500',
                !isDesktop && 'text-sm',
              )}
            >
              Test this biomarker
            </Body2>
          );

        const status = obs.status;
        const statusColor =
          STATUS_TO_COLOR[
            status.toLowerCase() as keyof typeof STATUS_TO_COLOR
          ] || STATUS_TO_COLOR.pending;

        if (obs?.dataType === 'text') {
          return (
            <span className="flex items-center gap-1.5 whitespace-nowrap text-black">
              <MessageSquareText className="size-4 shrink-0 text-zinc-400" />
              <Body2 className={cn(!isDesktop && 'text-sm')}>Lab Comment</Body2>
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: statusColor }}
              className="-mt-0.5 flex size-1.5 items-center gap-2 rounded-full"
            />
            <Body2
              style={{ color: statusColor }}
              className={cn('capitalize', !isDesktop && 'text-sm')}
            >
              {status.toLowerCase()}
            </Body2>
          </div>
        );
      },
    },
    {
      id: 'value',
      size: 120,
      header: () => <span className="text-sm text-zinc-400">Value</span>,
      cell: ({ row }: { row: Row<DataBiomarker> }) => {
        const obs = row.original.observation;
        if (!obs) return null;

        const currentValue = obs.value?.[0];

        const formatCurrentValue = () => {
          if (obs?.dataType === 'codedValue') {
            const latestValue = currentValue?.valueCoded;
            return latestValue ? (
              <span className="capitalize text-black">{latestValue}</span>
            ) : (
              '-'
            );
          }

          if (obs?.dataType === 'text') {
            return null;
          }

          if (obs?.dataType === 'range') {
            const range = currentValue?.valueRange;
            if (!range) return 'No value';
            const displayUnit = range.unit || obs.unit;
            return (
              <span>
                <span className="text-black">
                  {range.low}-{range.high}
                </span>{' '}
                <span className="text-zinc-500">{displayUnit}</span>
              </span>
            );
          }

          if (!currentValue?.quantity) return 'No value';

          const { value, unit, comparator } = currentValue.quantity;
          const displayUnit = unit || obs?.unit;

          return (
            <span>
              <span className="text-black">
                {getDisplayComparator(comparator)}
                {value}
              </span>{' '}
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
      id: 'optimalRange',
      size: 140,
      header: () => (
        <span className="text-sm text-zinc-400">Optimal Range</span>
      ),
      cell: ({ row }: { row: Row<DataBiomarker> }) => {
        const obs = row.original.observation;
        if (!obs) return null;

        const formatRange = () => {
          if (obs?.dataType === 'codedValue') {
            const { ranges: codedRanges } = getCodedBiomarkerRanges(obs);
            const optimalCoded = codedRanges.find(
              (r) => r.status === 'optimal',
            );
            const code = optimalCoded?.code;
            return code ? <span className="capitalize">{code}</span> : '-';
          }

          if (obs?.dataType === 'text') {
            const latestText = obs.value?.[0]?.valueText || '';
            if (!latestText) return null;

            return (
              <span
                className="line-clamp-4 inline-block max-h-16 overflow-hidden text-xs leading-4 text-zinc-400"
                style={{
                  width: '320px',
                  maskImage:
                    'linear-gradient(to bottom, black 70%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, black 70%, transparent 100%)',
                }}
              >
                {latestText}
              </span>
            );
          }

          if (!obs) return 'No optimal range';

          const { ranges } = getBiomarkerRanges(obs);
          const optimalRange = ranges.find((r) => r.status === 'OPTIMAL');

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
      id: 'history',
      size: 180,
      header: () => (
        <span className="text-sm text-zinc-400 md:ml-8">History</span>
      ),
      cell: ({ row }: { row: Row<DataBiomarker> }) => {
        const obs = row.original.observation;

        if (!obs) {
          return (
            <div className="flex w-full items-end">
              <Button
                size="small"
                variant="outline"
                className="ml-auto items-center gap-1 bg-white"
              >
                Learn More
              </Button>
            </div>
          );
        }

        if (obs.status === 'PENDING' || obs.status === 'UNKNOWN') {
          return <div className="h-16" />;
        }

        if (obs.dataType === 'codedValue') {
          return <LazyCodedValueSparkline biomarker={obs} />;
        }

        if (obs.dataType === 'range') {
          return <LazyRangeSparkline biomarker={obs} />;
        }

        if (obs.dataType === 'text') {
          return null;
        }

        return <LazySparklineChart biomarker={obs} />;
      },
    },
  ];

  let filteredColumns = allColumns;

  if (screenSize === 'mobile') {
    filteredColumns = allColumns.filter(
      (column) =>
        column.id === 'title' ||
        column.accessorKey === 'title' ||
        column.id === 'status' ||
        column.id === 'history',
    );
  } else if (screenSize === 'tablet') {
    filteredColumns = allColumns.filter(
      (column) =>
        column.id === 'title' ||
        column.accessorKey === 'title' ||
        column.id === 'status' ||
        column.id === 'value' ||
        column.id === 'history',
    );
  } else if (screenSize === 'desktop') {
    filteredColumns = allColumns.filter(
      (column) => column.id !== 'optimalRange',
    );
  }

  const hiddenSet = new Set(hiddenColumns);
  return filteredColumns.filter(
    (column) =>
      !hiddenSet.has(
        (column as { id?: string; accessorKey?: string }).id ??
          (column as { accessorKey?: string }).accessorKey ??
          '',
      ),
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
  currentCategory,
}: {
  biomarkers: DataBiomarker[];
  hideHeader?: boolean;
  hiddenColumns?: string[];
  isLoading?: boolean;
  displayPending?: boolean;
  hideDialog?: boolean;
  currentCategory?: DataSummaryCategory;
}) {
  'use no memo';

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'status', desc: false },
  ]);

  const screenSize = useScreenSize();

  const columns = useMemo(
    () => getColumns(screenSize, hiddenColumns),
    [screenSize, hiddenColumns],
  );

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updaterOrValue) => {
      setColumnFilters(
        updaterOrValue as React.SetStateAction<ColumnFiltersState>,
      );
    },
    [],
  );

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      setSorting(updaterOrValue as React.SetStateAction<SortingState>);
    },
    [],
  );

  const table = useReactTable({
    data: biomarkers,
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
          r.original.observation?.status !== 'PENDING' &&
          r.original.observation?.status !== 'UNKNOWN',
      );

  const visibleRows = filteredRows;

  if (biomarkers.length === 0 && !isLoading) {
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
            isLoading={isLoading}
            skeletonColSpan={skeletonColSpan}
            screenSize={screenSize}
            hideDialog={hideDialog}
            currentCategory={currentCategory}
          />
        </TableBody>
      </Table>
    </div>
  );
}
