import { Body1, H2 } from '@/components/ui/typography';
import { getCollectionInstructions } from '@/features/orders/utils/get-collection-instructions';

import { useScheduleStore } from '../../../stores/schedule-store';
import { AtHomeScheduler } from '../at-home-scheduler';
import { BloodDrawRecommendations } from '../blood-draw-recommendations';
import { InLabScheduler } from '../in-lab-scheduler';
import { ScheduleDuplicateNotice } from '../schedule-duplicate-notice';
import { ScheduleFlowFooter } from '../schedule-flow-footer';

export const SchedulerStep = () => {
  const { collectionMethod, slot } = useScheduleStore((s) => s);
  if (!collectionMethod) {
    throw new Error(
      'Collection method must be defined to use PhlebotomyScheduler',
    );
  }

  const instructions = getCollectionInstructions(collectionMethod);

  return (
    <div className="flex flex-1 flex-col justify-between">
      <BloodDrawRecommendations />
      <ScheduleDuplicateNotice />
      <div>
        <div className="space-y-1 pb-4">
          <H2>Select a time & location for your visit</H2>
          <Body1 className="text-zinc-500">{instructions}</Body1>
        </div>
        {collectionMethod === 'IN_LAB' ? <InLabScheduler /> : null}
        {['AT_HOME', 'PHLEBOTOMY_KIT'].includes(collectionMethod) ? (
          <AtHomeScheduler />
        ) : null}
      </div>
      <ScheduleFlowFooter nextBtnDisabled={!slot} />
    </div>
  );
};
