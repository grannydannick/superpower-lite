import type { CSSProperties } from 'react';

import { TableCell, TableRow } from '@/components/ui/table';
import { Body1, Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import {
  type WearableMetric,
  formatSourceName,
} from '../../const/wearable-metrics';
import { WearablesDataDialog } from '../dialogs/wearables-data-dialog';
import { LazySparkline } from '../sparkline-loader';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'widescreen';

const rowStyle: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto none auto 96px',
};

export function WearablesDataRow({
  metric,
  latestData,
  screenSize,
}: {
  metric: WearableMetric;
  latestData: Record<string, any>;
  screenSize: ScreenSize;
}) {
  const value = metric.accessor(latestData);
  if (value == null) return null;

  const isDesktop = screenSize === 'desktop' || screenSize === 'widescreen';
  const provider = metric.sourceAccessor(latestData);

  const cellPadding = screenSize === 'mobile' ? 'px-1 py-1.5' : 'py-2.5';

  return (
    <WearablesDataDialog
      metric={metric}
      latestValue={value}
      provider={provider}
    >
      <TableRow
        style={rowStyle}
        className="h-24 cursor-pointer rounded-xl border-transparent bg-white shadow-sm outline outline-1 -outline-offset-1 outline-zinc-100 transition-all hover:bg-white hover:outline-zinc-200"
      >
        {/* Name */}
        <TableCell
          className={cn(cellPadding, 'rounded-l-xl')}
          style={{ width: isDesktop ? 200 : 'auto' }}
        >
          <div className="flex items-center gap-2.5 pl-2 md:pl-0">
            <div>
              <Body1 className={cn('line-clamp-2', !isDesktop && 'text-sm')}>
                {metric.label}
              </Body1>
              <Body2 className="text-xs text-zinc-400">{metric.group}</Body2>
            </div>
          </div>
        </TableCell>

        {/* Value */}
        <TableCell
          className={cellPadding}
          style={{ width: isDesktop ? 140 : 'auto' }}
        >
          <Body2 className={cn(!isDesktop && 'text-sm')}>
            <span className="text-black">{metric.format(value)}</span>{' '}
            <span className="text-zinc-500">{metric.unit}</span>
          </Body2>
        </TableCell>

        {/* Data source - hidden on mobile */}
        {screenSize !== 'mobile' && (
          <TableCell
            className={cellPadding}
            style={{ width: isDesktop ? 120 : 'auto' }}
          >
            <Body2
              className={cn(
                'capitalize text-zinc-500',
                !isDesktop && 'text-sm',
              )}
            >
              {formatSourceName(provider)}
            </Body2>
          </TableCell>
        )}

        {/* History sparkline */}
        <TableCell
          className={cn(cellPadding, 'rounded-r-xl')}
          style={{ width: isDesktop ? 180 : 'auto', minWidth: '80px' }}
        >
          <LazySparkline
            metric={metric}
            className="-ml-8 md:ml-0"
            placeholderHeight="h-16"
          />
        </TableCell>
      </TableRow>
    </WearablesDataDialog>
  );
}
