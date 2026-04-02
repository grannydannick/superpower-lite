import { ChevronDown } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { useScreenSize } from '@/features/data/hooks/use-screen-size';
import { cn } from '@/lib/utils';

import { getAvailableMetrics } from '../../const/wearable-metrics';

import { WearablesDataRow } from './wearables-data-row';

type SortKey = 'name' | 'value' | 'source';
type SortDir = 'asc' | 'desc';

export function WearablesDataTable({
  latest,
  isLoading,
}: {
  latest: Record<string, unknown>;
  isLoading?: boolean;
}) {
  const screenSize = useScreenSize();
  const isDesktop = screenSize === 'desktop' || screenSize === 'widescreen';
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey],
  );

  const metrics = useMemo(() => {
    return getAvailableMetrics(latest);
  }, [latest]);

  const rows = useMemo(() => {
    if (!sortKey) return metrics;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...metrics].sort((a, b) => {
      const dataA = latest[a.resource] as Record<string, any>;
      const dataB = latest[b.resource] as Record<string, any>;
      switch (sortKey) {
        case 'name':
          return dir * a.label.localeCompare(b.label);
        case 'value': {
          const va = a.accessor(dataA) ?? 0;
          const vb = b.accessor(dataB) ?? 0;
          return dir * (va - vb);
        }
        case 'source': {
          const sa = a.sourceAccessor(dataA) ?? '';
          const sb = b.sourceAccessor(dataB) ?? '';
          return dir * sa.localeCompare(sb);
        }
      }
    });
  }, [metrics, latest, sortKey, sortDir]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-400">
        <H4 className="mb-2">No wearable data available</H4>
        <Body1 className="text-zinc-500">
          Connect a wearable device to see your metrics.
        </Body1>
      </div>
    );
  }

  const headerClass = cn(
    'mt-5 font-medium text-zinc-400',
    screenSize === 'mobile' && 'text-xs',
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
            ? 'border-spacing-x-0 border-spacing-y-1'
            : 'border-spacing-y-2',
        )}
        style={{
          tableLayout: isDesktop ? 'fixed' : 'auto',
          width: '100%',
          minWidth: isDesktop ? '100%' : '320px',
        }}
      >
        <TableHeader>
          <TableRow className="border-none hover:bg-transparent">
            <TableHead
              style={{ width: isDesktop ? 200 : 'auto' }}
              className={screenSize === 'mobile' ? 'px-1' : undefined}
            >
              <Button
                variant="ghost"
                className="mt-5 gap-2 p-0 text-sm text-zinc-400"
                onClick={() => toggleSort('name')}
              >
                Name
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform duration-200',
                    sortKey === 'name' && sortDir === 'asc' && 'rotate-180',
                  )}
                />
              </Button>
            </TableHead>
            <TableHead
              style={{ width: isDesktop ? 140 : 'auto' }}
              className={screenSize === 'mobile' ? 'px-1' : undefined}
            >
              <Button
                variant="ghost"
                className="mt-5 gap-2 p-0 text-sm text-zinc-400"
                onClick={() => toggleSort('value')}
              >
                Value
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform duration-200',
                    sortKey === 'value' && sortDir === 'asc' && 'rotate-180',
                  )}
                />
              </Button>
            </TableHead>
            {screenSize !== 'mobile' && (
              <TableHead style={{ width: isDesktop ? 120 : 'auto' }}>
                <Button
                  variant="ghost"
                  className="mt-5 gap-2 p-0 text-sm text-zinc-400"
                  onClick={() => toggleSort('source')}
                >
                  Source
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform duration-200',
                      sortKey === 'source' && sortDir === 'asc' && 'rotate-180',
                    )}
                  />
                </Button>
              </TableHead>
            )}
            <TableHead
              style={{ width: isDesktop ? 180 : 'auto', minWidth: '80px' }}
            >
              <Body2 className={cn(headerClass, 'md:ml-8')}>History</Body2>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody
          className={cn(
            screenSize === 'mobile' ? 'border-spacing-2' : 'border-spacing-8',
          )}
        >
          {rows.map((metric) => (
            <WearablesDataRow
              key={metric.key}
              metric={metric}
              latestData={latest[metric.resource] as Record<string, any>}
              screenSize={screenSize}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
