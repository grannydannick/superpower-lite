import { Button } from '@/components/ui/button';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { ActionPlanGoal } from '@/features/action-plan/components/action-plan-goal';
import { PlanItemList } from '@/features/action-plan/components/plan-item-list';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { cn } from '@/lib/utils';

export const Protocol = ({ className }: { className?: string }) => {
  const isAdmin = usePlan((s) => s.isAdmin);
  const addGoal = usePlan((s) => s.addGoal);
  const goals = usePlan((s) =>
    s.goals.filter((goal) => goal.type === 'ANNUAL_REPORT_PROTOCOLS'),
  );

  const hasEmptyGoalItems = goals.every((goal) => goal.goalItems.length === 0);

  if (!isAdmin && hasEmptyGoalItems) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <div className="space-y-4">
        <H2>Your protocol</H2>
        <Body1 className="text-zinc-500">
          Based off your action plan your clinician recommends you do the
          following:
        </Body1>
      </div>
      {goals.map((goal, idx) => {
        if (isAdmin) {
          return (
            <ActionPlanGoal
              key={goal.id}
              goal={goal}
              goalIndex={idx}
              className="mt-8"
            />
          );
        }

        return (
          <div className="space-y-2" key={goal.id}>
            <Body2 className="text-zinc-500">{goal.title}</Body2>
            <ul className="ml-5 list-outside list-disc">
              {goal.goalItems.map((goalItem, idx) => (
                <PlanItemList item={goalItem} key={idx} />
              ))}
            </ul>
          </div>
        );
      })}
      {isAdmin && (
        <div className="my-6">
          <Button
            variant="ghost"
            className="px-0 text-zinc-400"
            onClick={() => addGoal('ANNUAL_REPORT_PROTOCOLS')}
          >
            + Add goal
          </Button>
        </div>
      )}
    </div>
  );
};
