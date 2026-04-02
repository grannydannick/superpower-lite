import { memo, useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Body2 } from '@/components/ui/typography';
import { useResolveWearablesCitation } from '@/features/wearables/api/resolve-wearables-citation';
import { WearablesDataDialog } from '@/features/wearables/components/dialogs/wearables-data-dialog';
import { LazySparkline } from '@/features/wearables/components/sparkline-loader';
import {
  WEARABLE_METRICS,
  type WearableMetric,
} from '@/features/wearables/const/wearable-metrics';
import { cn } from '@/lib/utils';

import type { CitationInfo } from '../../../types/message-parts';
import type { ParsedWearablesCitation } from '../../../utils/parse-wearables-citation';

interface WearablesCitationCardProps {
  messageId: string;
  citation: CitationInfo;
  parsed: ParsedWearablesCitation;
}

/**
 * Single wearable metric card — matches `BiomarkerCitationCard` layout:
 * [{number} - {label}]  [group pill]  [{value} {unit}]  [sparkline]
 * Wrapped in `WearablesDataDialog` so clicking opens the timeseries view.
 */
function WearableCitationItem({
  citationNumber,
  metric,
  itemData,
}: {
  citationNumber: number;
  metric: WearableMetric;
  itemData: Record<string, any>;
}) {
  const value = metric.accessor(itemData);
  if (value == null) return null;

  const provider = metric.sourceAccessor(itemData);

  return (
    <WearablesDataDialog
      metric={metric}
      latestValue={value}
      provider={provider}
    >
      <div
        role="note"
        aria-label={`Citation ${citationNumber}: ${metric.label}`}
        className={cn(
          'flex h-[76px] scroll-mt-4 items-center justify-between overflow-clip',
          'rounded-[20px] border border-zinc-200 bg-white',
          'shadow-[0px_2px_2px_0px_rgba(0,0,0,0.02)]',
          'cursor-pointer transition-all hover:border-zinc-300',
        )}
      >
        {/* Name with citation number prefix */}
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center p-4">
          <p className="flex w-full gap-1 text-sm leading-5 text-zinc-900">
            <span className="text-zinc-400">{citationNumber} - </span>
            <span className="line-clamp-1">{metric.label}</span>
          </p>
        </div>

        {/* Group pill */}
        <div className="hidden w-[70px] shrink-0 flex-col items-start justify-center px-4 sm:flex">
          <div className="rounded-lg bg-zinc-100 px-2 py-0.5">
            <Body2 className="text-xs text-zinc-500">{metric.group}</Body2>
          </div>
        </div>

        {/* Value */}
        <div className="hidden w-[80px] shrink-0 flex-col items-start justify-center px-3 sm:flex">
          <Body2 className="text-xs">
            <span className="text-zinc-900">{metric.format(value)}</span>{' '}
            <span className="text-zinc-400">{metric.unit}</span>
          </Body2>
        </div>

        {/* Sparkline */}
        <div className="h-[52px] w-[150px] shrink-0 pr-4">
          <LazySparkline metric={metric} />
        </div>
      </div>
    </WearablesDataDialog>
  );
}

/**
 * Wearables citation card — resolves the citation URI and renders
 * one card per metric in the resource group, matching the biomarker
 * citation card style.
 */
export const WearablesCitationCard = memo(function WearablesCitationCard({
  citation,
  parsed,
}: WearablesCitationCardProps) {
  const { data, isLoading, isError } = useResolveWearablesCitation({
    uri: citation.source,
  });

  const metrics = useMemo(
    () => WEARABLE_METRICS.filter((m) => m.resource === parsed.resource),
    [parsed.resource],
  );

  if (isLoading) {
    return <Skeleton className="h-[76px] w-full rounded-[20px]" />;
  }

  if (isError || !data || !data.ok) {
    return null;
  }

  const itemData = (
    data.data.item as { data?: Record<string, unknown> } | undefined
  )?.data as Record<string, any> | undefined;

  if (!itemData || metrics.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {metrics.map((metric) => (
        <WearableCitationItem
          key={metric.key}
          citationNumber={citation.number}
          metric={metric}
          itemData={itemData}
        />
      ))}
    </div>
  );
});
