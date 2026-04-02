import { useState } from 'react';

import { Body1, H2 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL } from '@/const/services';
import { useCredits } from '@/features/orders/api/credits';
import { getCollectionInstructions } from '@/features/orders/utils/get-collection-instructions';

import { useScheduleStore } from '../../../stores/schedule-store';
import { AtHomeScheduler } from '../at-home-scheduler';
import { BloodDrawRecommendations } from '../blood-draw-recommendations';
import { InLabScheduler } from '../in-lab-scheduler';
import { ScheduleDuplicateNotice } from '../schedule-duplicate-notice';
import { ScheduleFlowFooter } from '../schedule-flow-footer';
import { UrineSampleRecommendations } from '../urine-sample-recommendations';

export const SchedulerStep = () => {
  const { collectionMethod, slot, selectedCreditIds } = useScheduleStore(
    (s) => s,
  );
  const { data: creditsData } = useCredits();
  const [showUrineSampleModal, setShowUrineSampleModal] = useState(false);

  if (!collectionMethod) {
    throw new Error(
      'Collection method must be defined to use PhlebotomyScheduler',
    );
  }

  const hasAdvancedPanel = creditsData?.credits.some(
    (credit) =>
      selectedCreditIds.has(credit.id) &&
      credit.serviceName === ADVANCED_BLOOD_PANEL,
  );

  const instructions = getCollectionInstructions(collectionMethod);

  return (
    <div className="flex flex-1 flex-col justify-between">
      <BloodDrawRecommendations
        onClose={() => {
          if (hasAdvancedPanel) {
            setShowUrineSampleModal(true);
          }
        }}
      />
      {showUrineSampleModal && <UrineSampleRecommendations />}
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
