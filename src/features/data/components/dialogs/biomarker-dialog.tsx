import { Description } from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import NumberFlow from '@/components/shared/number-flow';
import { Button } from '@/components/ui/button';
import { CodedValueChart } from '@/components/ui/charts/coded-value-chart';
import { TextValueChart } from '@/components/ui/charts/text-value-chart';
import { TimeSeriesChart } from '@/components/ui/charts/time-series-chart/time-series-chart';
import { TimeSeriesChartPlaceholder } from '@/components/ui/charts/time-series-chart/time-series-chart.placeholder';
import {
  getBiomarkerRanges,
  getCodedBiomarkerRanges,
} from '@/components/ui/charts/utils/get-biomarker-ranges';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, Body3, H4 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';
import type { Biomarker } from '@/types/api';
import { getDisplayComparator } from '@/utils/get-display-comparator';

import { STATUS_TO_COLOR } from '../../../../const/status-to-color';
import {
  dataBiomarkerContentQueryOptions,
  useDataBiomarker,
  useDataBiomarkerContent,
} from '../../api/get-data-biomarkers';
import { useTrackBiomarkerEvent } from '../../hooks/use-track-biomarker-event';
import type { DataBiomarker, DataSummaryCategory } from '../../types/data-api';

import { BiomarkerAiSuggestions } from './biomarker-ai-suggestions';
import {
  BiomarkerContentSkeleton,
  BiomarkerMdxContent,
} from './biomarker-mdx-content';
import { formatOptimalRange } from './utils/format-optimal-range';

type DialogState = 'loading' | 'not_found' | 'locked' | 'ready';

export const BiomarkerDialog = ({
  biomarkerId,
  children,
  disabled = false,
  currentCategory,
}: {
  biomarkerId: string;
  children: React.ReactNode;
  disabled?: boolean;
  currentCategory?: DataSummaryCategory;
}) => {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();

  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
  }, []);

  const prefetch = useCallback(() => {
    cancelPrefetch();
    prefetchTimerRef.current = setTimeout(() => {
      queryClient.prefetchQuery(dataBiomarkerContentQueryOptions(biomarkerId));
    }, 200);
  }, [queryClient, biomarkerId, cancelPrefetch]);

  useEffect(() => cancelPrefetch, [cancelPrefetch]);

  const { data: biomarker, isPending } = useDataBiomarker(biomarkerId, {
    enabled: open,
  });
  const obs = biomarker?.observation;

  const trackBiomarkerEvent = useTrackBiomarkerEvent({
    id: biomarkerId,
    biomarker,
    currentCategory,
  });

  const state = useMemo<DialogState>(() => {
    if (isPending) return 'loading';
    if (biomarker === null) return 'not_found';
    if (!obs) return 'locked';
    return 'ready';
  }, [isPending, biomarker, obs]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (newOpen) {
        trackBiomarkerEvent('viewed_biomarker');
      }
    },
    [trackBiomarkerEvent],
  );

  const title = obs?.name ?? biomarker?.title ?? '';

  const content = (
    <>
      <div className="-my-3 flex items-center justify-between">
        <DialogTitle>
          {state === 'loading' ? (
            <Skeleton className="h-5 w-32 rounded-full" />
          ) : (
            <Body1 className="line-clamp-2 text-zinc-500">{title}</Body1>
          )}
        </DialogTitle>
        <div className="-mr-3 flex items-center gap-2">
          {state === 'ready' ? <BiomarkerStatusBadge biomarker={obs!} /> : null}
          <DialogClose asChild>
            <Button variant="ghost" className="text-zinc-400">
              <X strokeWidth={2.5} className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>
      </div>

      {state === 'loading' ? (
        <BiomarkerLoadingView />
      ) : state === 'not_found' ? (
        <BiomarkerNotFoundView />
      ) : state === 'locked' ? (
        <BiomarkerLockedView biomarker={biomarker!} />
      ) : (
        <BiomarkerView biomarker={biomarker!} />
      )}
    </>
  );

  if (width <= 1024) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger
          asChild
          disabled={disabled}
          className={cn(disabled && 'pointer-events-none')}
          onPointerEnter={prefetch}
          onPointerLeave={cancelPrefetch}
          onFocus={prefetch}
          onBlur={cancelPrefetch}
        >
          {children}
        </SheetTrigger>
        <SheetContent className="flex h-[calc(100vh-6rem)] flex-col rounded-t-3xl p-4 pt-7 md:p-8">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        asChild
        disabled={disabled}
        className={cn(disabled && 'pointer-events-none')}
        onPointerEnter={prefetch}
        onPointerLeave={cancelPrefetch}
        onFocus={prefetch}
        onBlur={cancelPrefetch}
      >
        {children}
      </DialogTrigger>
      <DialogContent
        className={cn(
          'flex flex-col gap-0 overflow-x-hidden',
          dialogVariants({ size: '2xlarge' }),
          'max-h-[70vh] md:min-h-[750px]',
        )}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};

function BiomarkerLoadingView() {
  return (
    <div className="flex flex-col gap-4 pt-3">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid gap-2 min-[375px]:grid-cols-2">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
      <Skeleton className="h-4 w-1/3 rounded-full" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
}

function BiomarkerNotFoundView() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Body2 className="text-secondary">Biomarker not found</Body2>
    </div>
  );
}

function BiomarkerLockedView({ biomarker }: { biomarker: DataBiomarker }) {
  const { data: content, isPending: isContentPending } =
    useDataBiomarkerContent(biomarker.id);
  const trackBiomarkerEvent = useTrackBiomarkerEvent({
    id: biomarker.id,
    biomarker,
  });

  const handleUnlockClick = useCallback(() => {
    trackBiomarkerEvent('clicked_biomarker_product_cta');
  }, [trackBiomarkerEvent]);

  return (
    <>
      <div className="relative">
        <div className="absolute left-1/2 top-1/2 flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg">
          <Body2 className="text-center text-secondary">No data yet</Body2>
          {/* TODO: replace diagnosticTests[0].id with product id after marketplace refactor */}
          {biomarker.diagnosticTests[0] && (
            <Button asChild size="small" className="w-full">
              <RouterLink
                to="/services/$id"
                params={{ id: biomarker.diagnosticTests[0].id }}
                onClick={handleUnlockClick}
              >
                Unlock now
              </RouterLink>
            </Button>
          )}
        </div>
        <TimeSeriesChartPlaceholder />
      </div>
      <BiomarkerAiSuggestions name={biomarker.title} />
      {isContentPending ? (
        <BiomarkerContentSkeleton />
      ) : content ? (
        <BiomarkerMdxContent content={content} />
      ) : null}
    </>
  );
}

function BiomarkerView({ biomarker }: { biomarker: DataBiomarker }) {
  const obs = biomarker.observation!;
  const { data: content, isPending: isContentPending } =
    useDataBiomarkerContent(biomarker.id);
  const navigate = useNavigate();
  const trackBiomarkerEvent = useTrackBiomarkerEvent({
    id: biomarker.id,
    biomarker,
  });

  // TODO: replace diagnosticTests[0].id with product id after marketplace refactor
  const serviceId = biomarker.diagnosticTests[0]?.id;

  const handleBookNow = useCallback(() => {
    if (!serviceId) return;
    trackBiomarkerEvent('clicked_biomarker_product_cta');
    void navigate({
      to: '/services/$id',
      params: { id: serviceId },
    });
  }, [serviceId, trackBiomarkerEvent, navigate]);

  return (
    <>
      <div className="flex flex-col gap-4">
        {obs.dataType === 'codedValue' ? (
          <CodedValueChart biomarker={obs} />
        ) : obs.dataType === 'text' ? (
          <TextValueChart biomarker={obs} />
        ) : (
          <TimeSeriesChart
            biomarker={obs}
            hideBookNow={!serviceId}
            onBookNow={serviceId ? handleBookNow : undefined}
          />
        )}
        {obs.dataType !== 'text' ? (
          <div className="mb-4 grid gap-2 min-[375px]:grid-cols-2">
            <LatestResultCard biomarker={obs} />
            <OptimalRangeCard biomarker={obs} />
          </div>
        ) : null}
        <BiomarkerAiSuggestions name={obs.name} />
        {isContentPending ? (
          <BiomarkerContentSkeleton />
        ) : content ? (
          <BiomarkerMdxContent content={content} />
        ) : null}
      </div>
      <Description hidden>Insights about {obs.name}</Description>
    </>
  );
}

const LatestResultCard = ({ biomarker }: { biomarker: Biomarker }) => {
  const statusColor =
    STATUS_TO_COLOR[
      biomarker.status.toLowerCase() as keyof typeof STATUS_TO_COLOR
    ];

  const isCodedValue = biomarker.dataType === 'codedValue';
  const isRange = biomarker.dataType === 'range';
  const latestRange = biomarker.value[0]?.valueRange;

  return (
    <div className="flex flex-col gap-1 rounded-2xl border px-3 py-2 shadow-sm">
      <Body3 className="text-secondary">Latest result</Body3>
      <H4 className="truncate" style={{ color: statusColor }}>
        {isCodedValue ? (
          <span className="capitalize">
            {biomarker.value[0]?.valueCoded || '-'}
          </span>
        ) : isRange && latestRange ? (
          <>
            {latestRange.low}-{latestRange.high}{' '}
            <Body1 className="inline-block text-zinc-500">
              {latestRange.unit || biomarker.unit}
            </Body1>
          </>
        ) : (
          <>
            {getDisplayComparator(biomarker.value[0]?.quantity?.comparator)}
            <NumberFlow value={biomarker.value[0]?.quantity?.value || 0} />{' '}
            <Body1 className="inline-block text-zinc-500">
              {biomarker.value[0]?.quantity?.unit || biomarker.unit}
            </Body1>
          </>
        )}
      </H4>
    </div>
  );
};

const OptimalRangeCard = ({ biomarker }: { biomarker: Biomarker }) => {
  const isCodedValue = biomarker.dataType === 'codedValue';

  const { lastValueSource } = isCodedValue
    ? getCodedBiomarkerRanges(biomarker)
    : getBiomarkerRanges(biomarker);

  let optimalCodedValue: string | null = null;

  if (isCodedValue) {
    const codedRanges = biomarker.codedRanges?.[lastValueSource] || [];
    const optimal = codedRanges.find((range) => range.status === 'optimal');
    optimalCodedValue = optimal?.code || null;
  }

  const optimalRange = isCodedValue
    ? undefined
    : biomarker.ranges[lastValueSource].find(
        (range) => range.status === 'OPTIMAL',
      );

  const formattedRange = formatOptimalRange(optimalRange);

  return (
    <div className="flex flex-col gap-1 rounded-2xl border px-3 py-2 shadow-sm">
      <Body3 className="text-secondary">Optimal range</Body3>
      <H4 className="truncate" style={{ color: STATUS_TO_COLOR.optimal }}>
        {isCodedValue ? (
          <span className="capitalize">{optimalCodedValue || '-'}</span>
        ) : (
          <>
            {formattedRange.type === 'range' && (
              <>
                <NumberFlow value={formattedRange.lowValue} />
                -
                <NumberFlow value={formattedRange.highValue} />
              </>
            )}
            {formattedRange.type === 'single' && (
              <>
                {formattedRange.symbol}
                <NumberFlow value={formattedRange.value} />
              </>
            )}
            {formattedRange.type === 'none' && '-'}
            {formattedRange.type !== 'none' && (
              <>
                {' '}
                <Body1 className="inline-block text-zinc-500">
                  {biomarker.value[0]?.quantity?.unit || biomarker.unit}
                </Body1>
              </>
            )}
          </>
        )}
      </H4>
    </div>
  );
};

const BiomarkerStatusBadge = ({ biomarker }: { biomarker: Biomarker }) => {
  const statusColor =
    STATUS_TO_COLOR[
      biomarker.status.toLowerCase() as keyof typeof STATUS_TO_COLOR
    ];
  const statusColorLight =
    STATUS_TO_COLOR[
      `${biomarker.status.toLowerCase()}_light` as keyof typeof STATUS_TO_COLOR
    ];

  return (
    <div
      style={{ backgroundColor: statusColorLight }}
      className="flex items-center gap-1.5 rounded-full px-2 py-1"
    >
      <div
        style={{ backgroundColor: statusColor }}
        className="size-1.5 shrink-0 rounded-full"
      />
      <Body2
        style={{ color: statusColor, backgroundColor: statusColorLight }}
        className="capitalize"
      >
        {biomarker.status.toLowerCase()}
      </Body2>
    </div>
  );
};
