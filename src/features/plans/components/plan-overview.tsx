import { Calendar } from 'lucide-react';

import { H3 } from '@/components/ui/typography';
import { PhilosophyBlocks } from '@/features/plans/components/annual-report/philosophy-blocks';
import { SafeMarkdown } from '@/features/plans/components/plan-markdown';
import {
  PlanSection,
  PlanSectionContent,
  PlanSectionHeader,
} from '@/features/plans/components/plan-section';
import { useCarePlan } from '@/features/plans/context/care-plan-context';

export function PlanOverview() {
  const { plan, isAnnualReport } = useCarePlan();

  return (
    <PlanSection>
      <PlanSectionHeader>
        <H3 className="leading-none tracking-tight">
          {plan?.title || 'Care Plan'}
        </H3>
        <div className="text-sm text-gray-500">
          {plan?.period?.start && (
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              Start Date: {new Date(plan.period.start).toLocaleDateString()}
            </div>
          )}
          {plan?.author?.display && (
            <div className="flex items-center gap-2">
              Author: {plan.author.display}
            </div>
          )}
        </div>
      </PlanSectionHeader>

      {plan.description ? (
        <PlanSectionContent>
          <SafeMarkdown content={plan.description} />
        </PlanSectionContent>
      ) : null}
      {isAnnualReport ? <PhilosophyBlocks /> : null}
    </PlanSection>
  );
}
