// Animations removed for simplicity
import NumberFlow from '@number-flow/react';
import { CircleCheckBig } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { SplitScreenLayout } from '@/components/layouts/split-screen-layout';
import { TestimonialCarousel } from '@/components/shared/testimonials/components/testimonial-carousel';
import { Button } from '@/components/ui/button';
import { H3, H4 } from '@/components/ui/typography';
import { useTestKitServices } from '@/features/onboarding/hooks/use-test-kits';
import { useCreateBulkOrders } from '@/features/orders/api/create-bulk-orders';
import { CreateOrderInput } from '@/features/orders/api/create-order';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import * as Payment from '@/features/users/components/payment';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/api';

import { useOnboardingStepper } from '../onboarding-steps/onboarding-stepper';
import { ItemPreviews } from '../shared/item-previews';
import { UpsellServiceCard } from '../shared/upsell-service-card';

import { TestKitStepper } from './test-kit-stepper';

const CheckoutStepContent = () => {
  const { services, selectedServices, selectService } = useTestKitServices();
  const { data: user } = useUser();
  const { mutateAsync, isPending, error } = useCreateBulkOrders();
  const { track } = useAnalytics();
  const { next: nextTestKitStep } = TestKitStepper.useStepper();
  const { next: nextOnboardingStep } = useOnboardingStepper();

  const {
    isFlexSelected,
    hasFlexPaymentMethod,
    activePaymentMethod,
    activePaymentMethodId,
    startSelectingPaymentMethod,
  } = usePaymentMethodSelection();

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((acc, service) => acc + service.price, 0);
  }, [selectedServices]);

  const createBulkOrdersFromServices = useCallback(async () => {
    if (!user) return;

    const orders: CreateOrderInput[] = selectedServices.map((service) => {
      return {
        serviceId: service.id,
        location: {},
        status: OrderStatus.draft,
        paymentMethodId: activePaymentMethod?.externalPaymentMethodId,
      };
    });

    await mutateAsync({ data: orders });

    track('upsell_checkout_completed', {
      number_of_services: selectedServices.length,
      value: totalPrice,
      currency: 'USD',
      services: selectedServices.map((service) => service.name),
      service_ids: selectedServices.map((service) => service.id),
      payment_provider: activePaymentMethod?.paymentProvider.toLowerCase(),
    });

    return nextTestKitStep();
  }, [
    user,
    selectedServices,
    mutateAsync,
    track,
    totalPrice,
    activePaymentMethod?.paymentProvider,
    activePaymentMethod?.externalPaymentMethodId,
    nextTestKitStep,
  ]);

  const existingOrders = useMemo(() => {
    return services.some((service) => service.order);
  }, [services]);

  const handleBooking = async () => {
    if (existingOrders && !selectedServices?.length) {
      return nextTestKitStep();
    }

    if (!selectedServices?.length) {
      return nextOnboardingStep();
    }

    await createBulkOrdersFromServices();
  };

  const buttonContent = useMemo(() => {
    if (isPending) return <>Confirming…</>;

    let text = '';
    if (selectedServices.length > 0) {
      text = `Book additional tests${isFlexSelected ? ' with HSA/FSA' : ''}`;
    } else if (existingOrders) {
      text = 'Confirm booking details';
    } else {
      text = 'Continue without additional tests';
    }

    return (
      <>
        {isFlexSelected && <CircleCheckBig className="mr-2 size-[20px]" />}
        {text}
      </>
    );
  }, [isPending, selectedServices.length, existingOrders, isFlexSelected]);

  const showPricingCta = selectedServices.length > 0;

  return (
    <>
      <div className="mx-auto mb-16 flex w-full flex-col space-y-4 px-6 lg:mt-0 lg:max-w-[700px] lg:pt-16">
        <div>
          <H3>Order Summary</H3>
        </div>
        <div className="space-y-2">
          {services.map((service) => {
            if (!service) return null;

            return (
              <UpsellServiceCard
                service={service}
                services={services}
                selectedServices={selectedServices}
                toggleService={selectService}
                key={service.id}
              />
            );
          })}
        </div>
        {selectedServices.length > 0 && (
          <div>
            <H3 className="mb-4">Payment</H3>

            <Payment.CurrentPaymentMethodCard
              className="bg-white"
              error={
                error
                  ? 'There was an issue with your payment method. Please try again'
                  : undefined
              }
            />
          </div>
        )}

        {/* Pricing + CTA wrapper with simple CSS transition */}
        <div className="w-full space-y-4">
          <div
            className={cn(
              'transition-all duration-300 ease-out overflow-hidden',
              showPricingCta
                ? ''
                : '-mt-4 max-h-0 pointer-events-none blur-[2px] opacity-0',
            )}
          >
            {totalPrice > 0 && (
              <div className="my-4 flex justify-between gap-4 py-4">
                <H4>Total</H4>
                <H4 className="text-right text-zinc-500">
                  <NumberFlow
                    className="text-lg"
                    prefix="$"
                    value={Number(totalPrice / 100)}
                  />
                </H4>
              </div>
            )}

            <div className="space-y-4 pb-4">
              <Button
                onClick={handleBooking}
                disabled={isPending}
                className="w-full hover:bg-zinc-800 disabled:bg-zinc-700 disabled:opacity-100"
              >
                {buttonContent}
              </Button>
              {hasFlexPaymentMethod &&
                selectedServices.length > 0 &&
                !activePaymentMethodId && (
                  <Button
                    onClick={startSelectingPaymentMethod}
                    variant="outline"
                    className="w-full bg-white"
                  >
                    <CircleCheckBig className="mr-2 size-[20px] text-zinc-700" />
                    Select HSA/FSA card
                  </Button>
                )}
            </div>
          </div>
          {!showPricingCta && (
            <div className="space-y-4 pb-4">
              <Button
                onClick={handleBooking}
                disabled={isPending}
                className="w-full hover:bg-zinc-800 disabled:bg-zinc-700 disabled:opacity-100"
              >
                {buttonContent}
              </Button>
            </div>
          )}
        </div>
        <div>
          <TestimonialCarousel darkMode={false} />
        </div>
        <div className="h-24 md:hidden" />
      </div>
      <ItemPreviews services={services} />
    </>
  );
};

export const CheckoutStep = () => (
  <SplitScreenLayout title="Checkout" className="bg-zinc-50">
    <CheckoutStepContent />
  </SplitScreenLayout>
);
