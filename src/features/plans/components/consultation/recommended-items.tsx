import { Button } from '@/components/ui/button';
import { Mono } from '@/components/ui/typography';
import {
  PlanSection,
  PlanSectionHeader,
  PlanSectionTitle,
  PlanSectionContent,
} from '@/features/plans/components/plan-section';

import { useProductAvailability } from '../../hooks/use-product-availability';
import { ActionPlanCheckoutModal } from '../checkout/checkout-modal';

export const RecommendedItems = () => {
  const { hasProducts, hasAvailableProducts, productCount } =
    useProductAvailability();

  if (!hasProducts || !hasAvailableProducts) {
    return <div className="h-16" />;
  }

  return (
    <PlanSection>
      <PlanSectionHeader>
        <div className="mx-auto text-center">
          <PlanSectionTitle>
            Your longevity advisor has
            <br />
            recommended {productCount} items for you
          </PlanSectionTitle>
        </div>
      </PlanSectionHeader>
      <PlanSectionContent>
        <div className="flex flex-col items-center gap-6">
          <ActionPlanCheckoutModal>
            <Button variant="default" className="rounded-full">
              View protocol items
            </Button>
          </ActionPlanCheckoutModal>
          <Mono className="text-center opacity-70">
            PRODUCTS cheaper than Amazon. <br />
            you can always order independently if you prefer.
          </Mono>
        </div>
      </PlanSectionContent>
    </PlanSection>
  );
};
