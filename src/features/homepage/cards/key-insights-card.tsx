import { GoalIcon } from 'lucide-react';

import { Body1, Body2 } from '@/components/ui/typography';
import { BiomarkersDistributionBar } from '@/features/data/components/biomarkers-distribution-bar';
import { extractObservationId } from '@/features/messages/utils/parse-fhir-citation';
import { useLatestProtocol } from '@/features/protocol/api';
import { ProtocolGoalObservation } from '@/features/protocol/components/goals/protocol-goal-observation';

import { HomepageCard } from '../components/homepage-card';

export const KeyInsightsCard = () => {
  const { data: protocolData } = useLatestProtocol();
  const firstGoal = protocolData?.protocol?.goals[0];
  const goalObservations = firstGoal?.biomarkers ?? [];

  const noteText = firstGoal?.title ?? '';

  return (
    <HomepageCard title="Key Insights">
      <div className="space-y-9">
        {noteText && (
          <div className="flex items-start gap-1.5 text-pink-600">
            <GoalIcon className="inline-block size-4 align-text-bottom" />
            <div className="space-y-0.5">
              <Body2 className="text-pink-600">{`Top health priority:`}</Body2>
              <Body2>{noteText}</Body2>
            </div>
          </div>
        )}
        <div className="space-y-3">
          <Body1>Summary</Body1>
          <BiomarkersDistributionBar />
        </div>
        {goalObservations.length > 0 && (
          <div className="space-y-3">
            <Body1>Contributing Biomarkers</Body1>
            <div className="space-y-2">
              {goalObservations.map((obs) => {
                const id = extractObservationId(obs);

                return (
                  <ProtocolGoalObservation
                    id={id}
                    key={id}
                    className="overflow-x-auto"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </HomepageCard>
  );
};
