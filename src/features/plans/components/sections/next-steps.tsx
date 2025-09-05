import { CarePlanActivity } from '@medplum/fhirtypes';
import { ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { SuperpowerSignature } from '@/components/shared/superpower-signature';
import { Button } from '@/components/ui/button';
import { Body1, Body2, Body3, H2, H3, Mono } from '@/components/ui/typography';
import { useProducts } from '@/features/shop/api';
import { useScrollThreshold } from '@/hooks/use-scroll-threshold';
import { cn } from '@/lib/utils';

import { useCarePlan } from '../../context/care-plan-context';
import { useProductAvailability } from '../../hooks/use-product-availability';
import { useSection } from '../../hooks/use-section';
import { useCarePlanCart } from '../../stores/care-plan-cart-store';
import { ProductCard } from '../activities/product-card';
import { ActionPlanCheckoutModal } from '../checkout/checkout-modal';
import { NotificationDot } from '../notification-dot';

import { SectionTitle } from './section-title';

export const NextStepsSection = () => {
  const { plan } = useCarePlan();
  const { title, order, total } = useSection('next-steps');
  const { productCount, availableProducts } = useProductAvailability();
  const { selectedProducts } = useCarePlanCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const getProductsQuery = useProducts({});
  const isPastTopThreshold = useScrollThreshold({ thresholdPx: 50 });
  const isBeforeBottomThreshold = useScrollThreshold({
    thresholdPx: 300,
    thresholdFromBottom: true,
  });

  const isModalOpen = searchParams.get('modal') === 'checkout';
  const hasItemsInCart = selectedProducts.length > 0;
  const showRecommendedProducts =
    availableProducts.length > 0 && (productCount > 0 || hasItemsInCart);
  const isVisible =
    isPastTopThreshold &&
    isBeforeBottomThreshold &&
    !isModalOpen &&
    showRecommendedProducts;

  const handleCardClick = () => {
    setSearchParams((params) => {
      params.set('modal', 'checkout');
      return params;
    });
  };

  const getMessage = () => {
    if (hasItemsInCart) {
      return {
        line1: 'You have',
        line2: (
          <>
            <span className="font-semibold">
              {selectedProducts.length} item
              {selectedProducts.length !== 1 ? 's' : ''}
            </span>{' '}
            in your cart
          </>
        ),
      };
    }
    return {
      line1: 'Your care team has',
      line2: (
        <>
          recommended{' '}
          <span className="font-semibold">{productCount} products</span>
        </>
      ),
      line3: (
        <>
          <span className="font-semibold">
            {availableProducts.length} product
            {availableProducts.length !== 1 ? 's' : ''} available
          </span>
        </>
      ),
    };
  };

  const message = getMessage();

  // Get all product activities from the plan
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
    <section id="next-steps" className="space-y-4">
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
        adjustments as needed. Consider stocking up on the recommended
        supplements. You can either order through us at a discounted rate or
        source them on your own. If you have any additional questions, feel free
        to message your personal concierge or ask your Superpower AI.
      </Body1>
      <div className="py-8">
        {productActivities.length > 0 && (
          <H3 className="-mb-10">
            Your longevity advisor has recommended {productActivities.length}{' '}
            item
            {productActivities.length > 1 ? 's' : ''} for you
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
                  View all {productActivities.length} protocol items
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
      <button
        onClick={handleCardClick}
        className={cn(
          'fixed hidden lg:flex lg:flex-col items-center lg:items-start flex-row gap-4 lg:gap-0 bottom-[88px] lg:left-auto left-4 lg:bottom-4 right-4 hover:bg-zinc-50 z-10 lg:w-full lg:max-w-56 rounded-full lg:rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg shadow-black/5 transition-all duration-300 ease-in-out',
          isVisible
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none scale-[.99] translate-y-1 translate-x-1',
        )}
      >
        <NotificationDot className="absolute right-0 top-0 hidden lg:block" />
        <div className="flex items-center -space-x-1 lg:mb-2 ">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="aspect-square w-6 rounded-full bg-white p-0.5"
            >
              <img
                src={`/services/doctors/doc_${index + 1}.webp`}
                className="aspect-square w-full rounded-full"
                alt="Care team"
              />
            </div>
          ))}
        </div>
        <div className="mt-0.5 text-left text-sm">
          <Body2>{message.line1}</Body2>
          <Body2>{message.line2}</Body2>
          {availableProducts.length !== productCount && (
            <Body2 className="hidden lg:block">{message.line3}</Body2>
          )}
        </div>
        <ChevronRight className="ml-auto text-zinc-400 lg:hidden" />
      </button>
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
