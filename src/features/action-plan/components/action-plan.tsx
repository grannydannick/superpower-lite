import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Body2 } from '@/components/ui/typography';
import { ActionPlanGoal } from '@/features/action-plan/components/action-plan-goal';
import { BlockEditor } from '@/features/action-plan/components/editor/editor';
import { Protocol } from '@/features/action-plan/components/protocol';
import { RecommendedItems } from '@/features/action-plan/components/recommended-items';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { cn } from '@/lib/utils';

import { ConsultationCard } from './schedule-consultant-card';

const PLAN_STYLE = 'space-y-8 rounded-3xl bg-white p-8 shadow-md md:p-12';

export function ActionPlanComponent() {
  const {
    goals,
    timestamp,
    title,
    type,
    description,
    isAdmin,
    changeTitle,
    addGoal,
    changeDescription,
  } = usePlan((s) => s);

  if (type !== 'DEFAULT') {
    return null;
  }

  return (
    <div className="mb-10 w-full max-w-[728px] space-y-2.5">
      <div className={PLAN_STYLE}>
        <div className="space-y-3">
          <Body2 className="text-zinc-400">
            {format(new Date(timestamp ?? Date.now()), 'PP')}
          </Body2>
          <Input
            type="text"
            placeholder="Title"
            className={ACTION_PLAN_INPUT_STYLE}
            value={title}
            onChange={(e) => changeTitle(e.target.value)}
            disabled={!isAdmin}
          />
        </div>
        <BlockEditor
          initialContent={description}
          onUpdate={(content) => changeDescription(content)}
        />
      </div>
      <div className={cn(PLAN_STYLE, goals.length > 0 ? 'py-16' : null)}>
        {goals
          .filter((g) => g.type === 'DEFAULT')
          .map((goal, index) => (
            <ActionPlanGoal key={index} goal={goal} goalIndex={index} />
          ))}
        {isAdmin && (
          <div className="my-6">
            <Button
              variant="ghost"
              className="px-0 text-zinc-400"
              onClick={() => addGoal('DEFAULT')}
            >
              + Add goal
            </Button>
          </div>
        )}
      </div>
      <Protocol className={PLAN_STYLE} />
      <ConsultationCard className={PLAN_STYLE} />
      <RecommendedItems className={PLAN_STYLE} />
    </div>
  );
}
