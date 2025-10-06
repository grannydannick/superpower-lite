import { CarePlanActivity } from '@medplum/fhirtypes';

import { SuperpowerSignature } from '@/components/shared/superpower-signature';
import { Button } from '@/components/ui/button';
import { Body1, Body3, H2, H3, Mono } from '@/components/ui/typography';
import { useProducts } from '@/features/shop/api';

import { useCarePlan } from '../../context/care-plan-context';
import { useSection } from '../../hooks/use-section';
import { ProductCard } from '../activities/product-card';
import { ActionPlanCheckoutModal } from '../checkout/checkout-modal';
import { SectionTitle } from '../section-title';

export const NextStepsSection = () => {
  const { plan } = useCarePlan();
  const { title, order, total } = useSection('next-steps');
  const getProductsQuery = useProducts({});

  const productActivities: CarePlanActivity[] = [];
  const productAvailabilityMap = new Map<string, boolean>();

  if (plan?.activity) {
    plan.activity.forEach((activity) => {
      const { detail } = activity;
      if (detail?.productCodeableConcept?.coding?.[0]) {
        const productCode = detail.productCodeableConcept.coding[0].code;
        const product = getProductsQuery.data?.products?.find(
          (p) => p.id === productCode,
        );

        productActivities.push(activity);
        if (productCode) {
          productAvailabilityMap.set(productCode, !!product);
        }
      }
    });
  }

  return (
    <section id="next-steps" className="min-h-[70vh] space-y-4">
      <SectionTitle
        style={{
          backgroundImage: 'url(/action-plan/sections/yellow-background.webp)',
        }}
      >
        <Body1 className="text-white">
          {order} of {total}
        </Body1>
        <H2 className="text-white" id="section-title">
          {title}
        </H2>
      </SectionTitle>
      <Body1>
        To review the steps and track improvements, schedule your follow-up
        blood panel in 3 months ensuring interventions are effective and making
        adjustments as needed. <br /> <br /> Consider stocking up on the
        recommended supplements. You can either order through us at a discounted
        rate or source them on your own. <br /> <br /> If you have any
        additional questions, feel free to message your personal concierge or
        ask your Superpower AI.
      </Body1>
      <div className="py-8">
        {productActivities.length > 0 && (
          <H3 className="-mb-10">
            {productActivities.length} item
            {productActivities.length > 1 ? 's' : ''} recommended for you
          </H3>
        )}
        <div className="relative flex w-full flex-col items-center gap-6">
          {productActivities.length > 0 && (
            <>
              <div
                className="pointer-events-none max-h-96 w-full space-y-4 pt-16"
                style={{
                  maskImage:
                    'linear-gradient(to top, transparent 0%, black 50%)',
                  WebkitMaskImage:
                    'linear-gradient(to top, transparent 0%, black 50%)',
                }}
              >
                {productActivities.map((activity, index) => {
                  const productCoding =
                    activity.detail?.productCodeableConcept?.coding?.[0];
                  const productCode = productCoding?.code;
                  const productName =
                    productCoding?.display || 'Unnamed Product';
                  const product = getProductsQuery.data?.products?.find(
                    (p) => p.id === productCode,
                  );

                  return (
                    <ProductCard
                      key={`product-activity-${index}`}
                      productName={productName}
                      product={product}
                      hideButton={true}
                    />
                  );
                })}
              </div>
              <ActionPlanCheckoutModal>
                <Button
                  variant="default"
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full"
                >
                  {productActivities.length > 1
                    ? `View all ${productActivities.length} protocol items`
                    : `View protocol item`}
                </Button>
              </ActionPlanCheckoutModal>
            </>
          )}
        </div>
        {productActivities.length > 0 && (
          <Mono className="text-center opacity-70">
            PRODUCTS cheaper than Amazon. <br />
            you can always order independently if you prefer.
          </Mono>
        )}
      </div>
      <div className="mt-12 w-full">
        <Body3 className="text-center text-secondary">Written by</Body3>
        <div className="relative">
          <SuperpowerSignature className="mx-auto" isAnimated />
          <H3 className="sr-only absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center tracking-wider">
            Superpower
          </H3>
        </div>
      </div>
    </section>
  );
};
