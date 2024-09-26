import { Trash2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { BlockEditor } from '@/features/action-plan/components/editor/editor';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { ACTION_PLAN_SAVE_DELAY } from '@/features/action-plan/const/delay';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { cn } from '@/lib/utils';
import { PlanGoal } from '@/types/api';

import { ClinicianNotePopover } from './note-popover';
import { ActionPlanItemRow } from './plan-item-row';

interface ActionPlanGoalProps {
  goal: PlanGoal;
  goalIndex: number;
  className?: string;
}

export function ActionPlanGoal({
  goal,
  goalIndex,
  className,
}: ActionPlanGoalProps) {
  const {
    isAdmin,
    changeGoalTitle,
    deleteGoal,
    changeGoalDescription,
    updateActionPlan,
  } = usePlan((state) => ({
    isAdmin: state.isAdmin,
    changeGoalTitle: state.changeGoalTitle,
    deleteGoal: state.deleteGoal,
    changeGoalDescription: state.changeGoalDescription,
    updateActionPlan: state.updateActionPlan,
  }));

  const getGoalTitle = () => {
    switch (goal.type) {
      case 'ANNUAL_REPORT_PRIMARY':
      case 'DEFAULT':
        return (
          <h4 className="whitespace-nowrap text-xl text-zinc-900">
            Goal {goalIndex + 1}:
          </h4>
        );
      default:
        return null;
    }
  };

  const renderEditor = () => {
    switch (goal.type) {
      case 'ANNUAL_REPORT_PROTOCOLS':
        return null;
      default:
        return (
          <BlockEditor
            initialContent={goal.description}
            onUpdate={(content) => changeGoalDescription(content, goal.id)}
          />
        );
    }
  };

  const getInputClassName = () => {
    if (goal.type === 'ANNUAL_REPORT_PROTOCOLS') {
      return 'text-base placeholder:text-base';
    }
    return 'text-xl placeholder:text-2xl';
  };

  const debouncedGoalTitle = useDebouncedCallback(async (value: string) => {
    changeGoalTitle(value, goal.id);
    await updateActionPlan();
  }, ACTION_PLAN_SAVE_DELAY);

  return (
    <div id={String(goal.id)} className={cn('flex w-full', className)}>
      <div className="w-full">
        <div className="flex items-center gap-4">
          {getGoalTitle()}
          <Input
            placeholder="Goal title"
            className={cn(ACTION_PLAN_INPUT_STYLE, getInputClassName())}
            defaultValue={goal.title}
            onChange={(e) => debouncedGoalTitle(e.target.value)}
            disabled={!isAdmin}
          />
          {isAdmin && (
            <div
              role="presentation"
              className="flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-md"
              onClick={() => deleteGoal(goal.id)}
            >
              <Trash2 width={20} height={20} color="#B90090" />
            </div>
          )}
        </div>

        {renderEditor()}

        <div className="flex flex-col gap-1">
          {goal.goalItems.map((goalItem, idx) => (
            <div key={idx}>
              <ActionPlanItemRow goalId={goal.id} item={goalItem} />
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="my-10">
            <ClinicianNotePopover goal={goal} />
          </div>
        )}
      </div>
    </div>
  );
}
