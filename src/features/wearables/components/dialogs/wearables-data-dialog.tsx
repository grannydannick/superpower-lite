import { Description } from '@radix-ui/react-dialog';
import {
  addDays,
  addMonths,
  addYears,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Interval } from '@/components/ui/charts/wearables-series-chart/use-wearables-series-chart';
import { WearablesSeriesChart } from '@/components/ui/charts/wearables-series-chart/wearables-series-chart';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/slider-tabs';
import { Body1, Body3, H3, H4 } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { useWearablesTimeseries } from '../../api/get-wearables-timeseries';
import {
  type WearableMetric,
  formatSourceName,
} from '../../const/wearable-metrics';

const INTERVALS: { value: Interval; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All time' },
];

function computeWindow(
  interval: Interval,
  page: number,
): { start: Date; end: Date } | null {
  const now = new Date();

  if (interval === 'all') return null;

  let end: Date;
  let start: Date;

  switch (interval) {
    case 'day': {
      end = addDays(startOfDay(now), -page);
      start = end;
      end = addDays(end, 1);
      break;
    }
    case 'week': {
      end = addDays(startOfDay(now), 1 - page * 7);
      start = subDays(end, 7);
      break;
    }
    case 'month': {
      const monthStart = startOfMonth(now);
      start = subMonths(monthStart, page);
      end = addMonths(start, 1);
      break;
    }
    case 'year': {
      const yearStart = startOfYear(now);
      start = subYears(yearStart, page);
      end = addYears(start, 1);
      break;
    }
  }

  return { start, end };
}

function formatWindowLabel(interval: Interval, page: number): string {
  const window = computeWindow(interval, page);
  if (!window) return 'All time';

  const { start, end } = window;
  const endDisplay = subDays(end, 1);

  switch (interval) {
    case 'day':
      return format(start, 'MMM d, yyyy');
    case 'week':
      return `${format(start, 'MMM d')} – ${format(endDisplay, 'MMM d, yyyy')}`;
    case 'month':
      return format(start, 'MMMM yyyy');
    case 'year':
      return format(start, 'yyyy');
    default:
      return '';
  }
}

export const WearablesDataDialog = ({
  children,
  metric,
  latestValue,
  provider,
}: {
  children: React.ReactNode;
  metric: WearableMetric;
  latestValue: number;
  provider: string;
}) => {
  const [open, setOpen] = useState(false);
  const [interval, setInterval] = useState<Interval>('week');
  const [page, setPage] = useState(0);
  const { width } = useWindowDimensions();

  // Fetch ALL data once — no date params — then filter client-side
  const { data: tsData, isLoading } = useWearablesTimeseries({
    params: { resource: metric.resource, provider },
    enabled: open,
  });

  const allPoints = useMemo(() => {
    if (!tsData?.items) return [];
    return tsData.items
      .map((item) => {
        const value = metric.accessor(item);
        const timestamp = metric.timestampAccessor(item);
        if (value == null || !timestamp) return null;
        return { timestamp, value };
      })
      .filter(Boolean) as Array<{ timestamp: string; value: number }>;
  }, [tsData, metric]);

  const chartData = useMemo(() => {
    const window = computeWindow(interval, page);
    if (!window) return allPoints;
    const startMs = window.start.getTime();
    const endMs = window.end.getTime();
    return allPoints.filter((d) => {
      const t = new Date(d.timestamp).getTime();
      return t >= startMs && t < endMs;
    });
  }, [allPoints, interval, page]);

  const baseline = useMemo(() => {
    if (chartData.length === 0) return undefined;
    const sum = chartData.reduce((acc, d) => acc + d.value, 0);
    return sum / chartData.length;
  }, [chartData]);

  // Compute how far back navigation can go based on actual data
  const maxPage = useMemo(() => {
    if (allPoints.length === 0 || interval === 'all') return 0;
    const earliest = new Date(
      Math.min(...allPoints.map((d) => new Date(d.timestamp).getTime())),
    );
    const now = new Date();
    switch (interval) {
      case 'day': {
        const diff = startOfDay(now).getTime() - startOfDay(earliest).getTime();
        return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
      }
      case 'week': {
        const diff = startOfDay(now).getTime() - startOfDay(earliest).getTime();
        return Math.max(0, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)));
      }
      case 'month': {
        return Math.max(
          0,
          (now.getFullYear() - earliest.getFullYear()) * 12 +
            (now.getMonth() - earliest.getMonth()),
        );
      }
      case 'year': {
        return Math.max(0, now.getFullYear() - earliest.getFullYear());
      }
    }
  }, [allPoints, interval]);

  const handleIntervalChange = useCallback((newInterval: Interval) => {
    setInterval(newInterval);
    setPage(0);
  }, []);

  const content = (
    <>
      <div className="mb-1 flex items-center justify-between">
        <DialogTitle>
          <Body1 className="text-zinc-500">{metric.label}</Body1>
        </DialogTitle>
        <DialogClose asChild>
          <Button variant="ghost" className="text-zinc-400">
            <X strokeWidth={2.5} className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </div>

      <div className="flex flex-col gap-5">
        {/* Interval pills + date label */}
        <div className="flex items-center justify-between gap-3">
          <Tabs
            value={interval}
            onValueChange={(v) => handleIntervalChange(v as Interval)}
          >
            <TabsList className="gap-1">
              {INTERVALS.map((opt) => (
                <TabsTrigger
                  key={opt.value}
                  value={opt.value}
                  className="px-4 py-1 text-sm"
                >
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {interval !== 'all' && (
            <span className="min-w-0 shrink-0 text-sm text-zinc-500">
              {formatWindowLabel(interval, page)}
            </span>
          )}
        </div>

        {/* Chart */}
        <WearablesSeriesChart
          data={chartData}
          unit={metric.unit}
          formatValue={metric.format}
          interval={interval}
          baseline={baseline}
          baselineLabel="Baseline"
          isLoading={isLoading && allPoints.length === 0}
          {...(interval !== 'all' && {
            onPrevious: () => setPage((p) => Math.min(maxPage, p + 1)),
            onNext: () => setPage((p) => Math.max(0, p - 1)),
            canGoBack: page < maxPage,
            canGoForward: page > 0,
          })}
        />

        {/* Summary cards — 3 col, matching biomarker dialog card style */}
        <div className="mb-4 grid gap-2 min-[375px]:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-2xl border px-3 py-2 shadow-sm">
            <Body3 className="text-secondary">Latest</Body3>
            <H4 className="truncate text-emerald-500">
              {metric.format(latestValue)}{' '}
              <Body1 className="inline-block text-zinc-500">
                {metric.unit}
              </Body1>
            </H4>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border px-3 py-2 shadow-sm">
            <Body3 className="text-secondary">Baseline</Body3>
            <H4 className="truncate">
              {baseline != null ? metric.format(baseline) : '—'}{' '}
              <Body1 className="inline-block text-zinc-500">
                {baseline != null ? metric.unit : ''}
              </Body1>
            </H4>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border px-3 py-2 shadow-sm">
            <Body3 className="text-secondary">Data source</Body3>
            <H4 className="truncate capitalize">
              {formatSourceName(provider)}
            </H4>
          </div>
        </div>

        {/* Ask Superpower AI */}
        <div>
          <H3 className="mb-3">Ask Superpower AI</H3>
          <AiSuggestions
            context={`I'm currently looking at my ${metric.label} wearable data. My latest value is ${metric.format(latestValue)} ${metric.unit}. Please give me some suggestions for questions.`}
            limit={3}
            eventName="clicked_wearable_ai_suggestion"
            showAskOwn
          />
        </div>
      </div>

      <Description hidden>Details for {metric.label}</Description>
    </>
  );

  if (width <= 1024) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex h-[calc(100vh-6rem)] flex-col rounded-t-3xl p-4 pt-7 md:p-8">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          'flex flex-col gap-0 overflow-x-hidden',
          dialogVariants({ size: '2xlarge' }),
          'max-h-[70vh] pt-4 md:min-h-[650px]',
        )}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};
