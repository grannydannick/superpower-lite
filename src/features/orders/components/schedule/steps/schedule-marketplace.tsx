import { AddOnPanelsStep } from '@/features/add-on-panels/add-on-panels-step';
import { ADD_ON_PANELS_STEP_VARIANTS } from '@/features/add-on-panels/add-on-panels-variants';
import { useLocalAddOnPanelsCart } from '@/features/add-on-panels/use-local-add-on-panels-cart';

import { useScheduleStore } from '../../../stores/schedule-store';
import type { ScheduleMarketplaceVariant } from '../schedule-marketplace-variant';
import { useScheduleFlowStepper } from '../schedule-stepper';

interface ScheduleMarketplaceContentProps {
  variant: ScheduleMarketplaceVariant;
}

const ScheduleMarketplaceContent = ({
  variant,
}: ScheduleMarketplaceContentProps) => {
  const { next, prev, isFirst } = useScheduleFlowStepper();
  const cart = useLocalAddOnPanelsCart();
  const stepVariant =
    variant === 'retest'
      ? ADD_ON_PANELS_STEP_VARIANTS.scheduleRetest
      : ADD_ON_PANELS_STEP_VARIANTS.scheduleAddOns;

  const handlePrev = () => {
    if (isFirst) {
      window.history.back();
      return;
    }
    prev();
  };

  return (
    <div className="fixed inset-0 z-[51] flex flex-col bg-white">
      <AddOnPanelsStep
        cart={cart}
        navigation={{ next, prev: handlePrev }}
        variant={stepVariant}
      />
    </div>
  );
};

export const ScheduleMarketplaceStep = () => {
  const marketplaceVariant = useScheduleStore((s) => s.marketplaceVariant);

  if (marketplaceVariant === 'retest') {
    return <ScheduleMarketplaceContent variant="retest" />;
  }

  return <ScheduleMarketplaceContent variant="add-ons" />;
};
