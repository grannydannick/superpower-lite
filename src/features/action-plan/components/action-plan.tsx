import { format } from 'date-fns';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Body2 } from '@/components/ui/typography';
import { ActionPlanGoal } from '@/features/action-plan/components/action-plan-goal';
import { BlockEditor } from '@/features/action-plan/components/editor/editor';
// import { HealthScore } from '@/features/action-plan/components/health-score';
import { Protocol } from '@/features/action-plan/components/protocol';
import { RecommendedItems } from '@/features/action-plan/components/recommended-items';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { ACTION_PLAN_SAVE_DELAY } from '@/features/action-plan/const/delay';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useOrders } from '@/features/orders/api';
import { cn } from '@/lib/utils';

import { ConsultationCard } from './schedule-consultant-card';

const PLAN_STYLE = 'space-y-8 rounded-3xl bg-white p-8 shadow-md md:p-12';

export function ActionPlanComponent() {
  const {
    title,
    type,
    description,
    isAdmin,
    orderId,
    changeTitle,
    changeDescription,
    updateActionPlan,
  } = usePlan((s) => s);

  const ordersQuery = useOrders();

  const debouncedTitle = useDebouncedCallback(async (value) => {
    changeTitle(value);
    await updateActionPlan();
  }, ACTION_PLAN_SAVE_DELAY);

  if (type !== 'DEFAULT') {
    return null;
  }

  const relatedOrder = ordersQuery.data?.orders.find((o) => o.id === orderId);

  return (
    <div className="mb-10 w-full max-w-[728px] space-y-2.5">
      <div className={PLAN_STYLE}>
        <div className="space-y-3">
          <Body2 className="text-zinc-400">
            {ordersQuery.isLoading ? (
              <Skeleton className="h-5 w-14" />
            ) : (
              format(new Date(relatedOrder?.timestamp ?? Date.now()), 'PP')
            )}
          </Body2>
          <Input
            type="text"
            placeholder="Title"
            className={ACTION_PLAN_INPUT_STYLE}
            defaultValue={title ?? ''}
            onChange={(e) => debouncedTitle(e.target.value)}
            disabled={!isAdmin}
          />
        </div>
        <BlockEditor
          initialContent={description}
          onUpdate={(content) => changeDescription(content)}
        />
      </div>

      {/*<HealthScore className={PLAN_STYLE} />*/}
      <ActionPlanGoals />
      <Protocol className={PLAN_STYLE} />
      <ConsultationCard className={PLAN_STYLE} />
      <RecommendedItems className={PLAN_STYLE} />
    </div>
  );
}

const ActionPlanGoals = () => {
  const goals = usePlan((s) => s.goals);
  const isAdmin = usePlan((s) => s.isAdmin);
  const addGoal = usePlan((s) => s.addGoal);

  const defaultGoals = goals.filter((g) => g.type === 'DEFAULT');

  if (!isAdmin && !defaultGoals.length) {
    return null;
  }

  return (
    <div className={cn(PLAN_STYLE, goals.length > 0 ? 'py-16' : null)}>
      {defaultGoals.map((goal, index) => (
        <ActionPlanGoal key={goal.id} goal={goal} goalIndex={index} />
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
  );
};
