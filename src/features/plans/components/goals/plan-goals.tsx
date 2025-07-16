import { Body1 } from '@/components/ui/typography';

import { useCarePlan } from '../../context/care-plan-context';
import { PlanGoal } from '../goals/plan-goal';
import {
  PlanSection,
  PlanSectionHeader,
  PlanSectionTitle,
  PlanSectionContent,
} from '../plan-section';

export function PlanGoals() {
  const { plan } = useCarePlan();

  const goals = plan.goal ?? [];

  return (
    <PlanSection>
      <PlanSectionHeader>
        <PlanSectionTitle>Monitored issues</PlanSectionTitle>
      </PlanSectionHeader>

      <PlanSectionContent className="flex flex-col gap-4">
        <Body1 className="mb-4 text-zinc-500">
          We map your action plan to our core pillars of functional health and
          longevity.{' '}
          <a
            href="https://superpower.com/editorial/superpower-baseline-recommendations"
            className="text-vermillion-900"
            target="_blank"
            rel="noreferrer"
          >
            Read More
          </a>
        </Body1>
        <div className="space-y-16">
          {goals.map((goal, index) =>
            goal.resource ? (
              <PlanGoal
                goal={goal.resource}
                index={index}
                key={goal.resource.id}
              />
            ) : null,
          )}
        </div>
      </PlanSectionContent>
    </PlanSection>
  );
}
