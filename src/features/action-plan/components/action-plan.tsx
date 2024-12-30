import { useDebouncedCallback } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { BlockEditor } from '@/features/action-plan/components/editor/editor';
import { Header } from '@/features/action-plan/components/header';
import { HealthScore } from '@/features/action-plan/components/health-score';
import { RecommendedItems } from '@/features/action-plan/components/recommended-items';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { ACTION_PLAN_SAVE_DELAY } from '@/features/action-plan/const/delay';
import { usePlan } from '@/features/action-plan/stores/plan-store';

import { GoalsWrapper } from './goals-wrapper';
import { ConsultationCard } from './schedule-consultant-card';

const PLAN_STYLE = 'space-y-8 rounded-3xl bg-white p-8 shadow-md md:p-12';

export function ActionPlanComponent() {
  const {
    title,
    type,
    description,
    isAdmin,
    changeTitle,
    changeDescription,
    updateActionPlan,
  } = usePlan((s) => s);

  const debouncedTitle = useDebouncedCallback(async (value) => {
    changeTitle(value);
    await updateActionPlan();
  }, ACTION_PLAN_SAVE_DELAY);

  if (type !== 'DEFAULT') {
    return null;
  }

  return (
    <div className="mb-10 w-full max-w-screen-md space-y-2.5">
      <Header />
      <div className={PLAN_STYLE}>
        <div className="space-y-3">
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
      <GoalsWrapper title="Monitored issues" goalType="DEFAULT" />
      <GoalsWrapper title="Your protocol" goalType="ANNUAL_REPORT_PROTOCOLS" />
      <ConsultationCard className={PLAN_STYLE} />
      <RecommendedItems className={PLAN_STYLE} />
    </div>
  );
}
