import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { H2 } from '@/components/ui/typography';
import { ActionPlanGoal } from '@/features/action-plan/components/action-plan-goal';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { cn } from '@/lib/utils';

export const CoreMonitoredIssues: ({
  className,
}: {
  className?: string;
}) => ReactNode = ({ className }) => {
  const isAdmin = usePlan((s) => s.isAdmin);
  const addGoal = usePlan((s) => s.addGoal);
  const goals = usePlan((s) =>
    s.goals.filter((goal) => goal.type === 'ANNUAL_REPORT_PRIMARY'),
  );

  if (!goals) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <H2 className="text-2xl md:text-2xl">Core monitored issues</H2>
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
            onClick={() => addGoal('ANNUAL_REPORT_PRIMARY')}
          >
            + Add goal
          </Button>
        </div>
      )}
    </div>
  );
};
