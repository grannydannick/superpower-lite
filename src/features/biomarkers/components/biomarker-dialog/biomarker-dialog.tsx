import { Info } from 'lucide-react';

import NumberFlow from '@/components/shared/number-flow';
import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1, Body3, H4 } from '@/components/ui/typography';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { Biomarker } from '@/types/api';

import { BiomarkerTimeSeriesChart } from '../charts/biomarker-time-series-chart';

import { BiomarkerDialogBanner } from './biomarker-dialog-banner';
import { BiomarkerDialogFooter } from './biomarker-dialog-footer';
import { BiomarkerDialogHeader } from './biomarker-dialog-header';
import { BiomarkerDialogMetadata } from './biomarker-dialog-metadata';

export interface BiomarkerDetailsProps {
  biomarker: Biomarker | undefined;
}

export function BiomarkerDialog({
  biomarker,
}: BiomarkerDetailsProps): JSX.Element {
  if (!biomarker) return <></>;

  const { name, unit, description, importance, status, metadata } = biomarker;

  const { ranges } = getBiomarkerRanges(biomarker);
  const optimalRange = ranges.find((range) => range.status === 'OPTIMAL');

  const sortedBiomarkerValues = biomarker.value.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Passing sorted value back as a result.
  // Value is always the last data point in the time series data.
  return (
    <>
      <BiomarkerDialogHeader
        name={name}
        status={status}
        result={sortedBiomarkerValues[0]}
        unit={unit}
      />
      <BiomarkerDialogBanner
        biomarkerName={name}
        result={sortedBiomarkerValues[0]}
      />
      <div className="p-6">
        <BiomarkerTimeSeriesChart biomarker={biomarker} />
      </div>
      <div className="mb-4 grid gap-2 px-6 min-[375px]:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-zinc-100 px-3 py-2 shadow-sm">
          <Body3 className="text-secondary">Latest result</Body3>
          <H4
            className="truncate"
            style={{
              color:
                STATUS_TO_COLOR[
                  status.toLowerCase() as keyof typeof STATUS_TO_COLOR
                ],
            }}
          >
            <NumberFlow value={biomarker.value[0]?.quantity.value || 0} />{' '}
            <Body1 className="inline-block text-zinc-500">
              {biomarker.unit}
            </Body1>
          </H4>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col gap-1 rounded-2xl border border-zinc-100 px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <Body3 className="text-secondary">Optimal range</Body3>

                  <Info className="size-4 text-zinc-400" />
                </div>
                <H4
                  className="truncate"
                  style={{
                    color: STATUS_TO_COLOR['optimal'],
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
            </TooltipTrigger>
            <TooltipContent className="max-w-[245px] text-balance rounded-xl border-none bg-black px-4 py-3 text-white shadow-md">
              Different labs use varying testing methods and reference ranges.
              Your results are displayed using each lab&apos;s specific
              standards to ensure accuracy.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex flex-col gap-1 rounded-2xl border border-zinc-100 px-3 py-2 shadow-sm">
          <Body3 className="text-secondary">Data source</Body3>
          {/* In the future we might want to fetch this from the API */}
          <H4 className="truncate">Blood Test</H4>
        </div>
      </div>
      <Separator />
      <BiomarkerDialogMetadata
        className="space-y-8 p-6"
        name={name}
        description={description}
        content={metadata.content}
        importance={importance}
      />
      <BiomarkerDialogFooter
        containerClassName="sticky bottom-0"
        className="text-zinc-500"
        source={biomarker.metadata.source}
      />
    </>
  );
}
