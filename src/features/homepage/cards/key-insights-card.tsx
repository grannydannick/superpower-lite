import { GoalIcon } from 'lucide-react';

import { Body1, Body2 } from '@/components/ui/typography';
import { BiomarkersDistributionBar } from '@/features/data/components/biomarkers-distribution-bar';
import { PlanGoalObservation } from '@/features/plans/components/goals/plan-goal-observation';
import { useLatestCompletedPlan } from '@/features/plans/hooks/use-latest-completed-plan';

import { HomepageCard } from '../components/homepage-card';

export const KeyInsightsCard = () => {
  const { firstGoal, goalObservations } = useLatestCompletedPlan();

  const noteText = firstGoal?.description?.text || '';

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
              <div className="space-y-2">
                {goalObservations.map((id) => (
                  <PlanGoalObservation id={id} key={id} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </HomepageCard>
  );
};
