import { Description } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import NumberFlow from '@/components/shared/number-flow';
import { Button } from '@/components/ui/button';
import { TimeSeriesChart } from '@/components/ui/charts/time-series-chart/time-series-chart';
import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dialogVariants } from '@/components/ui/dialog/utils/dialog-variants';
import { Body1, Body2, Body3, H4 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

import { STATUS_TO_COLOR } from '../../../../const/status-to-color';

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
  const { lastValueSource } = getBiomarkerRanges(biomarker);
  const { track } = useAnalytics();

  const statusColor =
    STATUS_TO_COLOR[
      biomarker.status.toLowerCase() as keyof typeof STATUS_TO_COLOR
    ];
  const statusColorLight =
    STATUS_TO_COLOR[
      `${biomarker.status.toLowerCase()}_light` as keyof typeof STATUS_TO_COLOR
    ];

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);

    if (newOpen) {
      track('viewed_biomarker', {
        biomarker_name: biomarker.name,
        biomarker_interpretation: biomarker.status,
      });
    }
  }, []);

  const optimalRange = useMemo(() => {
    return biomarker.ranges[lastValueSource].find(
      (range) => range.status === 'OPTIMAL',
    );
  }, [biomarker.ranges, lastValueSource]);

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
        <div className="-my-3 flex items-center justify-between">
          <DialogTitle>
            <Body1 className="line-clamp-2 text-zinc-500">
              {biomarker.name}
            </Body1>
          </DialogTitle>
          <div className="-mr-3 flex items-center gap-2">
            {biomarker.status !== 'RECOMMENDED' ? (
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
            ) : null}
            <DialogClose asChild>
              <Button variant="ghost" className="text-zinc-400">
                <X strokeWidth={2.5} className="size-4" />
              </Button>
            </DialogClose>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <TimeSeriesChart biomarker={biomarker} />
          {biomarker.status !== 'RECOMMENDED' ? (
            <div className="mb-4 grid gap-2 min-[375px]:grid-cols-2">
              <div className="flex flex-col gap-1 rounded-2xl border px-3 py-2 shadow-sm">
                <Body3 className="text-secondary">Latest result</Body3>
                <H4
                  className="truncate"
                  style={{
                    color: statusColor,
                  }}
                >
                  <NumberFlow value={biomarker.value[0]?.quantity.value || 0} />{' '}
                  <Body1 className="inline-block text-zinc-500">
                    {biomarker.unit}
                  </Body1>
                </H4>
              </div>
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
                  <Body1 className="inline-block text-zinc-500">
                    {biomarker.unit}
                  </Body1>
                </H4>
              </div>
            </div>
          ) : null}

          <BiomarkerContentTabs biomarker={biomarker} className="min-h-96" />
        </div>
        <Description hidden>Insights about {biomarker.name}</Description>
      </DialogContent>
    </Dialog>
  );
};
