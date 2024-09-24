import { Button } from '@/components/ui/button';
import { H2, Mono } from '@/components/ui/typography';
import { ActionPlanCheckoutModal } from '@/features/action-plan/components/checkout-modal';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { cn } from '@/lib/utils';

export const RecommendedItems = ({ className }: { className?: string }) => {
  const goals = usePlan((s) => s.goals);

  const productItems = goals
    .flatMap((goal) => goal.goalItems)
    .filter((item) => item.itemType === 'PRODUCT');

  return (
    <div className={cn(className, 'flex flex-col items-center')}>
      <H2 className="max-w-[456px] text-center">
        Your longevity clinician has recommended {productItems.length} items for
        you
      </H2>
      <div className="flex flex-col items-center gap-6">
        <ActionPlanCheckoutModal goals={goals}>
          <Button variant="default" className="rounded-full">
            View protocol items
          </Button>
        </ActionPlanCheckoutModal>
        <Mono className="text-center opacity-70">
          PRODUCTS cheaper than Amazon. <br />
          you can always order independently if you prefer.
        </Mono>
      </div>
    </div>
  );
};
