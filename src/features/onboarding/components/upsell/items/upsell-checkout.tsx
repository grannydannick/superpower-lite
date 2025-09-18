import NumberFlow from '@number-flow/react';
import moment from 'moment';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import { TestimonialCarousel } from '@/components/shared/testimonials/components/testimonial-carousel';
import { Button } from '@/components/ui/button';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1, H3, H4 } from '@/components/ui/typography';
import { useUpsellOrders } from '@/features/onboarding/hooks/use-upsell-orders';
import { getUpsellServices } from '@/features/onboarding/utils/get-upsell-services';
import { useOrders } from '@/features/orders/api';
import { useCreateBulkOrders } from '@/features/orders/api/create-bulk-orders';
import { CreateOrderInput } from '@/features/orders/api/create-order';
import { getDefaultCollectionMethod } from '@/features/orders/utils/get-default-collection-method';
import { useServices } from '@/features/services/api';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { CurrentPaymentMethodCard } from '@/features/users/components/current-payment-method-card';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { HealthcareService, OrderStatus } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

import { ItemPreview } from '../item-preview';
import { ItemPreviews } from '../item-previews';

const AnimatedCheckmark = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="mr-3 text-vermillion-900"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.6673 5L7.50065 14.1667L3.33398 10"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: '20 20',
          strokeDashoffset: isOpen ? '0' : '20',
          transition: 'stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'stroke-dashoffset',
        }}
      />
    </svg>
  );
};

export const UpsellCheckout = ({
  services,
  updateServices,
}: {
  services: HealthcareService[];
  updateServices: (services: HealthcareService[]) => void;
}) => {
  const { data: user } = useUser();
  const { data: ordersData } = useOrders();
  const { mutateAsync, isPending, error } = useCreateBulkOrders();
  const { track } = useAnalytics();

  const { nextStep, activeStep } = useStepper((s) => s);
  const { mutateAsync: updateTaskProgress, isError } = useUpdateTask();
  const { data: upsellOrders } = useUpsellOrders();

  const { jump, getStepIndexById } = useStepper((s) => s);
  const { data: allServices } = useServices();

  const upsellServices = getUpsellServices(allServices?.services ?? []);

  const totalPrice = useMemo(() => {
    return services.reduce((acc, service) => acc + service.price, 0);
  }, [services]);

  const isServiceAlreadyOrdered = useCallback(
    (serviceId: string) => {
      return (
        ordersData?.orders?.some((order) => order.serviceId === serviceId) ??
        false
      );
    },
    [ordersData?.orders],
  );

  const updateStep = useCallback(async () => {
    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: activeStep },
    });

    if (!isError) {
      nextStep();
    }
  }, [activeStep, isError, nextStep, updateTaskProgress]);

  const skipStep = async () => {
    const stepToJump = getStepIndexById('mission');
    if (stepToJump === -1) {
      toast.error("Something went wrong. Can't skip this step.");
    }

    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: stepToJump },
    });

    if (!isError) {
      jump('mission');
    }
  };

  const createBulkOrdersFromServices = useCallback(async () => {
    if (!user) return;
    const orders: CreateOrderInput[] = [];

    for (const service of services) {
      const collectionMethod = getDefaultCollectionMethod(service);

      const data: CreateOrderInput = {
        serviceId: service.id,
        location: {},
        timestamp: new Date().toISOString(),
        timezone: moment.tz.guess(),
        method: collectionMethod ? [collectionMethod] : [],
        status: OrderStatus.draft,
      };

      orders.push(data);
    }

    await mutateAsync({ data: orders });

    return updateStep();
  }, [user, mutateAsync, services, updateStep, track]);

  const isAllServicesPaid = useMemo(() => {
    return services.every((service) => service.price === 0);
  }, [services]);

  return (
    <>
      <div className="mx-auto -mt-20 mb-16 flex w-full flex-col space-y-4 px-6 lg:mt-0 lg:max-w-[512px] lg:pt-16">
        <H3>Order Summary</H3>
        <div className="space-y-2">
          {upsellServices.map((s) => {
            if (!s) return null;
            const isAlreadyOrdered = isServiceAlreadyOrdered(s.item.id);

            return (
              <Button
                disabled={isPending || !!error || isAlreadyOrdered}
                variant="ghost"
                key={s.item.id}
                onClick={() => {
                  updateServices(
                    services.some((service) => service.id === s.item.id)
                      ? services.filter((service) => service.id !== s.item.id)
                      : [...services, s.item],
                  );
                }}
                className={cn(
                  'flex w-full bg-white items-center hover:border-zinc-300 justify-between rounded-[20px] border border-zinc-200 p-3',
                  services.some((service) => service.id === s.item.id) &&
                    'border-vermillion-900 hover:border-vermillion-700 shadow-md shadow-vermillion-700/5',
                )}
              >
                <div className="flex items-center gap-2">
                  <ItemPreview
                    image={s.item.image}
                    className="w-12 rounded-md bg-transparent xs:w-16"
                  />
                  <div className="flex min-w-0 flex-1 flex-col items-start">
                    <Body1 className="max-w-40 truncate md:max-w-none">
                      {s.item.name}
                    </Body1>
                    <Body1 className="text-secondary">
                      {isAlreadyOrdered
                        ? '$0 (Paid already)'
                        : formatMoney(s.item.price)}
                    </Body1>
                  </div>
                </div>
                <AnimatedCheckmark
                  isOpen={services.some((service) => service.id === s.item.id)}
                />
              </Button>
            );
          })}
        </div>
        <div className="flex justify-between gap-4 pb-4">
          <H4>Total</H4>
          <H4 className="text-right text-zinc-500">
            <NumberFlow
              format={{
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              }}
              value={Math.floor(totalPrice / 100)}
              className="text-base"
            />
          </H4>
        </div>
        {services.length > 0 && (
          <>
            <H3 className="mb-4">Payment</H3>

            <CurrentPaymentMethodCard
              className="bg-white"
              error={
                error
                  ? 'There was an issue with your payment method. Please try again'
                  : undefined
              }
            />
          </>
        )}

        <Button
          onClick={() => {
            // if all services are paid, we just update the step so we get to booking
            if (isAllServicesPaid) {
              return updateStep();
            }

            // we skip checkout if no services are selected
            if (services.length === 0) {
              skipStep();
            } else {
              createBulkOrdersFromServices();
            }
          }}
          disabled={isPending || !!error}
          className="sticky top-[calc(100dvh-4.5rem)] z-30 order-first my-8 w-full hover:bg-zinc-800 disabled:bg-zinc-700 disabled:opacity-100 lg:static lg:order-none"
        >
          {isPending ? (
            <TextShimmer
              className="line-clamp-1 text-base [--base-color:white] [--base-gradient-color:#a1a1aa]"
              duration={1}
            >
              Confirming…
            </TextShimmer>
          ) : isAllServicesPaid &&
            (services.length > 0 || upsellOrders.length > 0) ? (
            'Book services'
          ) : services.length === 0 ? (
            "No, I don't want additional tests"
          ) : (
            'Confirm'
          )}
        </Button>
        <TestimonialCarousel darkMode={false} />
        <div className="h-24 md:hidden" />
      </div>
      <ItemPreviews
        selectedServices={services as (HealthcareService & { image: string })[]}
      />
    </>
  );
};
