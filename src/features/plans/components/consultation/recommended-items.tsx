import { Button } from '@/components/ui/button';
import { Mono } from '@/components/ui/typography';
import {
  PlanSection,
  PlanSectionHeader,
  PlanSectionTitle,
  PlanSectionContent,
} from '@/features/plans/components/plan-section';
import { useProducts } from '@/features/shop/api';

import { useCarePlan } from '../../context/care-plan-context';
import { parseProductRequests } from '../../utils/parse-product-requests';
import { ActionPlanCheckoutModal } from '../checkout/checkout-modal';

export const RecommendedItems = () => {
  const { plan } = useCarePlan();
  const { data: productsData } = useProducts({});

  const productRequests = parseProductRequests(plan.activity ?? []);

  if (
    !plan.activity ||
    plan.activity.length === 0 ||
    productRequests.length === 0
  ) {
    return <div className="h-16" />;
  }

  const availableProductCount = productRequests.reduce((count, productId) => {
    const productExists = productsData?.products?.some(
      (p) => p.id === productId,
    );
    return productExists ? count + 1 : count;
  }, 0);

  if (availableProductCount === 0) {
    return <div className="h-16" />;
  }

  const productCount = productRequests.length;

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
