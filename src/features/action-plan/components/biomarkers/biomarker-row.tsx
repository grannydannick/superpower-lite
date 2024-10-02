import { Circle } from 'lucide-react';

import { Body2 } from '@/components/ui/typography';
import { BiomarkerTableDialogRow } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-table-dialog-row';
import { BiomarkerSparklineChart } from '@/features/biomarkers/components/charts/biomarker-sparkline-chart';
import { BiomarkerRange } from '@/features/biomarkers/components/range';
import { BiomarkerValueUnit } from '@/features/biomarkers/components/value-unit';
import { STATUS_TO_COLOR } from '@/features/biomarkers/const/status-to-color';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import { Biomarker } from '@/types/api';

export const ActionPlanBiomarkerRow = ({
  biomarker,
}: {
  biomarker: Biomarker;
}) => {
  const result = mostRecent(biomarker.value);

  return (
    <BiomarkerTableDialogRow biomarker={biomarker}>
      <div className="flex h-[60px] grow items-center justify-between rounded-xl bg-zinc-50 py-2.5 pl-5 pr-3 hover:cursor-pointer">
        <div className="flex w-1/2 flex-col items-start">
          <div className="flex flex-col justify-start gap-1">
            <div className="flex items-center gap-2.5">
              <Circle
                className="size-2 min-w-2 md:hidden"
                style={{
                  fill: STATUS_TO_COLOR[biomarker.status.toLowerCase()],
                }}
                strokeWidth={0}
              />
              <Body2 className="line-clamp-1 max-w-[200px]">
                {biomarker.name}
              </Body2>
            </div>
            <BiomarkerValueUnit
              baseUnit={biomarker.unit}
              result={result}
              textClassName="text-xs md:text-xs"
            />
          </div>
        </div>

        <div className="flex w-1/2 items-center justify-end md:justify-between">
          <BiomarkerRange
            biomarker={biomarker}
            className="hidden rounded-[20px] px-3 py-2 text-xs md:block"
          />
          <BiomarkerSparklineChart
            biomarker={biomarker}
            className="h-[44px] sm:ml-0"
            height={44}
            markerRadius={8}
            markerLineWidth={1}
          />
        </div>
      </div>
    </BiomarkerTableDialogRow>
  );
};
