import { Trash2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { useShallow } from 'zustand/react/shallow';

import { Input } from '@/components/ui/input';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  PRODUCT_TYPE_SUPPLEMENT,
  TOTAL_TOXIN_TEST,
} from '@/const';
import { useProducts } from '@/features/action-plan/api/get-products';
import { Disclaimer } from '@/features/action-plan/components/disclaimer';
import { BlockEditor } from '@/features/action-plan/components/editor/editor';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { ACTION_PLAN_SAVE_DELAY } from '@/features/action-plan/const/delay';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useServices } from '@/features/services/api/get-services';
import { cn } from '@/lib/utils';
import { PlanGoal } from '@/types/api';

import { ClinicianNotePopover } from './note-popover';
import { PlanItemList } from './plan-item-list';
import { ActionPlanItemRow } from './plan-item-row';

interface ActionPlanGoalProps {
  goal: PlanGoal;
  goalIndex: number;
  className?: string;
}

export function ActionPlanGoal({ goal, className }: ActionPlanGoalProps) {
  const {
    isAdmin,
    deleteGoal,
    changeGoalDescription,
    changeGoalTitle,
    updateActionPlan,
  } = usePlan(useShallow((s) => s));

  const servicesQuery = useServices();
  const productsQuery = useProducts();

  const cancerService = servicesQuery.data?.services.find(
    (s) => s.name === GRAIL_GALLERI_MULTI_CANCER_TEST,
  );
  const totalToxinService = servicesQuery.data?.services.find(
    (s) => s.name === TOTAL_TOXIN_TEST,
  );

  const showPhysicianDisclaimer = goal.goalItems.some(
    (goalItem) =>
      goalItem.itemId === cancerService?.id ||
      goalItem.itemId === totalToxinService?.id,
  );

  const supplements =
    productsQuery.data?.products.filter(
      (p) => p.type === PRODUCT_TYPE_SUPPLEMENT,
    ) ?? [];

  const showSupplementDisclaimer = goal.goalItems.some((goalItem) =>
    supplements.some((s) => s.id === goalItem.itemId),
  );

  const renderEditor = () => {
    switch (goal.type) {
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
    return 'text-xl placeholder:text-2xl';
  };

  const debouncedGoalTitle = useDebouncedCallback(async (value: string) => {
    changeGoalTitle(value, goal.id);
    await updateActionPlan();
  }, ACTION_PLAN_SAVE_DELAY);

  return (
    <div className={cn('flex w-full', className)}>
      <div className="w-full">
        <div className="flex items-center gap-4">
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

        {goal.type === 'ANNUAL_REPORT_PROTOCOLS' && !isAdmin ? (
          <div className="space-y-4">
            <ul className="ml-5 list-outside list-disc">
              {goal.goalItems.map((goalItem, idx) => (
                <PlanItemList item={goalItem} key={idx} />
              ))}
            </ul>
            {showSupplementDisclaimer ? (
              <Disclaimer>
                <p className="text-zinc-500">
                  Consult your primary care physician before starting new
                  supplement, especially if you have health conditions or take
                  medications
                </p>
              </Disclaimer>
            ) : null}
            {showPhysicianDisclaimer ? (
              <Disclaimer>
                <p className="text-zinc-500">
                  The Grail Galleri test and the Total Toxins test are advanced
                  screenings that require further evaluation and approval by one
                  of SuperPower&#39;s qualified and licensed physicians or nurse
                  practitioners.
                </p>
              </Disclaimer>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {goal.goalItems.map((goalItem) => (
              <ActionPlanItemRow
                goalId={goal.id}
                item={goalItem}
                key={goalItem.id}
              />
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="my-10">
            <ClinicianNotePopover goal={goal} />
          </div>
        )}
      </div>
    </div>
  );
}
