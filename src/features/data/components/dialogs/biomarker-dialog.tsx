import { Description } from '@radix-ui/react-dialog';
import { Lock, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NumberFlow from '@/components/shared/number-flow';
import { Button } from '@/components/ui/button';
import { TimeSeriesChart } from '@/components/ui/charts/time-series-chart/time-series-chart';
import { TimeSeriesChartPlaceholder } from '@/components/ui/charts/time-series-chart/time-series-chart.placeholder';
import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Body1, Body2, Body3, H4 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

import { STATUS_TO_COLOR } from '../../../../const/status-to-color';
import { getServiceActionUrl } from '../../utils/get-service-action-url';

import { BiomarkerContentTabs } from './biomarker-content-tabs';

export const BiomarkerDialog = ({
  children,
  biomarker,
  disabled = false,
}: {
  children: React.ReactNode;
  biomarker: Biomarker;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const { track } = useAnalytics();
  const navigate = useNavigate();

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);

    if (newOpen) {
      track('viewed_biomarker', {
        biomarker_name: biomarker.name,
        biomarker_interpretation: biomarker.status,
      });
    }
  }, []);

  const content = (
    <>
      <div className="-my-3 flex items-center justify-between">
        <DialogTitle>
          <Body1 className="line-clamp-2 text-zinc-500">{biomarker.name}</Body1>
        </DialogTitle>
        <div className="-mr-3 flex items-center gap-2">
          {biomarker.status !== 'RECOMMENDED' ? (
            <BiomarkerStatusBadge biomarker={biomarker} />
          ) : null}
          <DialogClose asChild>
            <Button variant="ghost" className="text-zinc-400">
              <X strokeWidth={2.5} className="size-4" />
            </Button>
          </DialogClose>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {biomarker.status === 'RECOMMENDED' ? (
          <div className="relative">
            <Button
              variant="outline"
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col space-y-2 rounded-2xl border border-zinc-200 bg-white shadow-lg"
              onClick={() => {
                const firstServiceId =
                  biomarker.recommendedTests.services[0]?.id;

                if (firstServiceId) {
                  navigate(getServiceActionUrl(firstServiceId));
                }
              }}
            >
              <Lock className="size-[18px] text-secondary" />
              <span>
                <Body2>Discover your value</Body2>
                <Body3 className="text-secondary">Test now</Body3>
              </span>
            </Button>
            <TimeSeriesChartPlaceholder />
          </div>
        ) : (
          <TimeSeriesChart biomarker={biomarker} />
        )}
        {biomarker.status !== 'RECOMMENDED' ? (
          <div className="mb-4 grid gap-2 min-[375px]:grid-cols-2">
            <LatestResultCard biomarker={biomarker} />
            <OptimalRangeCard biomarker={biomarker} />
          </div>
        ) : null}

        <BiomarkerContentTabs biomarker={biomarker} />
      </div>
      <Description hidden>Insights about {biomarker.name}</Description>
    </>
  );

  if (width <= 1024) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger
          asChild
          disabled={disabled}
          className={cn(disabled && 'pointer-events-none')}
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
      >
        {children}
      </DialogTrigger>
      <DialogContent
        className={cn(
          'flex flex-col overflow-x-hidden gap-0',
          dialogVariants({ size: '2xlarge' }),
          'md:min-h-[750px] max-h-[70vh]',
        )}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};

const LatestResultCard = ({ biomarker }: { biomarker: Biomarker }) => {
  const statusColor =
    STATUS_TO_COLOR[
      biomarker.status.toLowerCase() as keyof typeof STATUS_TO_COLOR
    ];

  return (
    <div className="flex flex-col gap-1 rounded-2xl border px-3 py-2 shadow-sm">
      <Body3 className="text-secondary">Latest result</Body3>
      <H4
        className="truncate"
        style={{
          color: statusColor,
        }}
      >
        <NumberFlow value={biomarker.value[0]?.quantity.value || 0} />{' '}
        <Body1 className="inline-block text-zinc-500">{biomarker.unit}</Body1>
      </H4>
    </div>
  );
};

const OptimalRangeCard = ({ biomarker }: { biomarker: Biomarker }) => {
  const { lastValueSource } = getBiomarkerRanges(biomarker);

  const optimalRange = useMemo(() => {
    return biomarker.ranges[lastValueSource].find(
      (range) => range.status === 'OPTIMAL',
    );
  }, [biomarker.ranges, lastValueSource]);

  return (
    <div className="flex flex-col gap-1 rounded-2xl border px-3 py-2 shadow-sm">
      <Body3 className="text-secondary">Optimal range</Body3>
      <H4
        className="truncate"
        style={{
          color: STATUS_TO_COLOR.optimal,
        }}
      >
        <NumberFlow value={optimalRange?.low?.value || 0} />
        -
        <NumberFlow value={optimalRange?.high?.value || 0} />{' '}
        <Body1 className="inline-block text-zinc-500">{biomarker.unit}</Body1>
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
        style={{
          backgroundColor: statusColor,
        }}
        className="size-1.5 shrink-0 rounded-full"
      />
      <Body2
        style={{
          color: statusColor,
          backgroundColor: statusColorLight,
        }}
        className="capitalize"
      >
        {biomarker.status.toLowerCase()}
      </Body2>
    </div>
  );
};
