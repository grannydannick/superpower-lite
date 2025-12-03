import { Circle } from 'lucide-react';

import { SparklineChart } from '@/components/ui/charts/sparkline-chart/sparkline-chart';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body2 } from '@/components/ui/typography';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { useBiomarkers } from '@/features/data/api';
import { BiomarkerDialog } from '@/features/data/components/dialogs/biomarker-dialog';
import { BiomarkerRange } from '@/features/data/components/range';
import { BiomarkerValueUnit } from '@/features/data/components/value-unit';
import { cn } from '@/lib/utils';

export type ProtocolGoalObservationProps = {
  id: string;
  className?: string;
};

export function ProtocolGoalObservation({
  id,
  className,
}: ProtocolGoalObservationProps) {
  const { data, isLoading } = useBiomarkers();

  if (isLoading) {
    return <Skeleton className="h-[82px] w-full rounded-[20px]" />;
  }

  if (!data) return null;

  const biomarker = data.biomarkers.find((b) =>
    b.value.some((v) => v.id.toString() === id.toString()),
  );

  if (!biomarker) return null;

  const { status, name } = biomarker;

  return (
    <BiomarkerDialog biomarker={biomarker}>
      <div
        className={cn(
          'flex bg-white h-20 transition-all hover:bg-zinc-50 grow items-center justify-between rounded-2xl border border-zinc-200 shadow shadow-black/[0.025] py-2.5 pl-6 pr-3 hover:cursor-pointer',
          className,
        )}
      >
        <div className="flex w-1/2 flex-col items-start xs:w-1/3">
          <div className="flex flex-col justify-start gap-1">
            <div className="flex items-center gap-2.5">
              <Circle
                className="size-2 min-w-2 md:hidden"
                style={{
                  fill: STATUS_TO_COLOR[
                    status.toLowerCase() as keyof typeof STATUS_TO_COLOR
                  ],
                }}
                strokeWidth={0}
              />
              <Body2 className="line-clamp-1 max-w-[200px]">{name}</Body2>
            </div>
          </div>
        </div>

        <div className="flex w-1/2 items-center justify-end gap-2 xs:w-2/3 md:justify-between">
          <TooltipProvider>
            <div className="flex-1">
              <Tooltip delayDuration={75}>
                <TooltipTrigger className="hidden xs:block">
                  <BiomarkerValueUnit
                    result={biomarker?.value[0]}
                    baseUnit={biomarker.unit}
                    textClassName="md:text-xs text-xs"
                  />
                </TooltipTrigger>
                <TooltipContent>Your result</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-1 justify-center">
              <Tooltip delayDuration={75}>
                <TooltipTrigger className="hidden md:block">
                  <BiomarkerRange
                    biomarker={biomarker}
                    className="rounded-lg px-2 py-1.5 text-xs transition-colors duration-200 hover:bg-zinc-200 hover:text-zinc-700"
                  />
                </TooltipTrigger>
                <TooltipContent>Optimal range</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
          <SparklineChart biomarker={biomarker} />
        </div>
      </div>
    </BiomarkerDialog>
  );
}
