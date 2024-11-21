import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { H2 } from '@/components/ui/typography';
import { ActionPlanGoal } from '@/features/action-plan/components/action-plan-goal';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { cn } from '@/lib/utils';
import { PlanGoalType } from '@/types/api';

export const CoreMonitoredIssues: ({
  title,
  className,
  goalType,
}: {
  title: string;
  className?: string;
  goalType: PlanGoalType;
}) => ReactNode = ({ title, className, goalType }) => {
  const isAdmin = usePlan((s) => s.isAdmin);
  const addGoal = usePlan((s) => s.addGoal);
  const goals = usePlan((s) =>
    s.goals.filter((goal) => goal.type === goalType),
  );

  if (!isAdmin && !goals.length) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <H2>{title}</H2>
      {goals.map((goal, idx) => (
        <ActionPlanGoal
          key={goal.id}
          goal={goal}
          goalIndex={idx}
          className="mt-8"
        />
      ))}
      {isAdmin && (
        <div className="my-6">
          <Button
            variant="ghost"
            className="px-0 text-zinc-400"
            onClick={() => addGoal(goalType)}
          >
            + Add goal
          </Button>
        </div>
      )}
    </div>
  );
};
