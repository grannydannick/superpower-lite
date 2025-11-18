import { ChevronRightIcon, GoalIcon } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { Body2 } from '@/components/ui/typography';
import { BiomarkerDistributionBar } from '@/features/data/components/biomarkers-distribution-bar';
import { PlanGoalObservation } from '@/features/plans/components/goals/plan-goal-observation';
import { useLatestCompletedPlan } from '@/features/plans/hooks/use-latest-completed-plan';

import { HomepageCard } from '../components/homepage-card';

export const KeyInsightsCard = () => {
  const {
    data: latestPlan,
    firstGoal,
    goalObservations,
  } = useLatestCompletedPlan();

  const noteText = firstGoal?.description?.text || '';

  return (
    <HomepageCard title="Key Insights">
      <div className="space-y-6">
        {noteText && (
          <Link
            to={`/plans/${latestPlan?.id}`}
            className="mt-4 flex flex-row justify-between"
          >
            <Body2 className="text-pink-600">
              <GoalIcon className="inline-block size-4 align-text-bottom" />
              {` Top health priority: ${noteText}`}
            </Body2>
            <ChevronRightIcon className="inline-block size-4" />
          </Link>
        )}
        <Body2 className="text-zinc-500">Summary</Body2>
        <BiomarkerDistributionBar />
        {goalObservations.length > 0 && (
          <>
            <Body2 className="text-zinc-500">Contributing Biomarkers</Body2>
            <div className="space-y-2">
              <div className="space-y-2">
                {goalObservations.map((id) => (
                  <PlanGoalObservation id={id} key={id} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </HomepageCard>
  );
};
