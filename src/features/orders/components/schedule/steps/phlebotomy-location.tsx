import { Body1, Body3, H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { useScheduleStore } from '../../../stores/schedule-store';
import { PhlebotomyLocationSelector } from '../phlebotomy-location-selector';
import { ScheduleFlowFooter } from '../schedule-flow-footer';

export const PhlebotomyLocationSelectStep = () => {
  const { collectionMethod } = useScheduleStore((s) => s);

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className={cn('space-y-8')}>
        <div className="space-y-2">
          <H2>Where would you like to get tested?</H2>
          <Body1 className="text-secondary">
            Select an in-person lab test or at-home visit.
          </Body1>
        </div>
        <div className="space-y-4">
          <PhlebotomyLocationSelector />
          <Body3 className="text-zinc-400">
            Late cancellation or rescheduling fees apply.
          </Body3>
        </div>
      </div>
      <ScheduleFlowFooter nextBtnDisabled={!collectionMethod} />
    </div>
  );
};
