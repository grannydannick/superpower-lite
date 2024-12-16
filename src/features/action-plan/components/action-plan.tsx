import { format } from 'date-fns';
import { useDebouncedCallback } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Body2 } from '@/components/ui/typography';
import { BlockEditor } from '@/features/action-plan/components/editor/editor';
import { HealthScore } from '@/features/action-plan/components/health-score';
import { RecommendedItems } from '@/features/action-plan/components/recommended-items';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { ACTION_PLAN_SAVE_DELAY } from '@/features/action-plan/const/delay';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useOrders } from '@/features/orders/api';

import { CoreMonitoredIssues } from './core-monitored-issues';
import { ConsultationCard } from './schedule-consultant-card';

const PLAN_STYLE = 'space-y-8 rounded-3xl bg-white p-8 shadow-md md:p-12';

export function ActionPlanComponent() {
  const {
    title,
    type,
    description,
    isAdmin,
    timestamp,
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

  return (
    <div className="mb-10 w-full max-w-screen-md space-y-2.5">
      <div className={PLAN_STYLE}>
        <div className="space-y-3">
          <Body2 className="text-zinc-400">
            {ordersQuery.isLoading ? (
              <Skeleton className="h-5 w-14" />
            ) : (
              format(new Date(timestamp ?? Date.now()), 'PP')
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

      <HealthScore className={PLAN_STYLE} />
      <CoreMonitoredIssues title={'Monitored issues'} goalType={'DEFAULT'} />
      <CoreMonitoredIssues
        title={'Your protocol'}
        goalType={'ANNUAL_REPORT_PROTOCOLS'}
      />
      <ConsultationCard className={PLAN_STYLE} />
      <RecommendedItems className={PLAN_STYLE} />
    </div>
  );
}
