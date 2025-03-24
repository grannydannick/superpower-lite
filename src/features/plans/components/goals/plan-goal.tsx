import { Goal } from '@medplum/fhirtypes';

import { H3 } from '@/components/ui/typography';
import { PlanGoalObservation } from '@/features/plans/components/goals/plan-goal-observation';
import { SafeMarkdown } from '@/features/plans/components/plan-markdown';

export type PlanGoalProps = {
  goal: Goal;
  index: number;
};

export function PlanGoal({ goal, index }: PlanGoalProps) {
  const goalObservations =
    (goal.addresses
      ?.map((a) => a.reference?.split('/')[1])
      .filter((r) => r !== undefined) as string[]) ?? [];

  const noteText = goal.note?.map((n) => n.text).join('\n\n') || '';

  return (
    <div className="space-y-8">
      <H3>
        {goal.description.text ||
          goal.description.coding?.[0].display ||
          `Goal #${index}`}
      </H3>

      {noteText && <SafeMarkdown content={noteText} />}

      <div className="space-y-2">
        {goalObservations.map((id) => (
          <PlanGoalObservation id={id} key={id} />
        ))}
      </div>
    </div>
  );
}
