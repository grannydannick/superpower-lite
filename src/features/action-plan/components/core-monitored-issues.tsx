import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { H2 } from '@/components/ui/typography';
import { ActionPlanGoal } from '@/features/action-plan/components/action-plan-goal';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { cn } from '@/lib/utils';
import { PlanGoalType } from '@/types/api';

const REPORT_STYLE = 'space-y-8 rounded-3xl bg-white p-8 shadow-md md:p-12';

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
  ).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (!isAdmin && !goals.length) {
    return null;
  }

  return (
    <div className={cn(className, REPORT_STYLE)}>
      <H2>{title}</H2>
      {title.toLowerCase().includes('your protocol') && (
        <p className="text-zinc-500">
          Based on your action plan your clinician recommends you do the
          following:
        </p>
      )}
      {title.toLowerCase().includes('monitored issues') && (
        <p className="text-zinc-500">
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
        </p>
      )}
      {goals.map((goal, idx) => (
        <>
          <ActionPlanGoal
            key={goal.id}
            goal={goal}
            goalIndex={idx}
            className="mt-8"
          />
          {idx !== goals.length - 1 && <Separator />}
        </>
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
