import { useQueryClient } from '@tanstack/react-query';
import { CircleCheckBig } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import {
  getRevealStatusQueryKey,
  useCompleteReveal,
  useCreateServiceOrders,
  useRevealStatus,
  useProtocol,
} from '@/features/protocol/api';
import { CheckoutLayout } from '@/features/protocol/components/layouts/checkout-layout';
import { REVEAL_STEPS } from '@/features/protocol/components/reveal/reveal-stepper';
import { CreatePaymentMethodForm } from '@/features/settings/components/billing/create-payment-method-form';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment/current-payment-method-card';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

type ServiceCheckoutStepProps = {
  carePlanId: string;
  next: () => void;
  previous: () => void;
};

type ServiceCheckoutItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
};

export const ServiceCheckoutStep = ({
  carePlanId,
  next,
  previous,
}: ServiceCheckoutStepProps) => {
  const queryClient = useQueryClient();
  const revealStatusQuery = useRevealStatus(carePlanId);
  const protocolQuery = useProtocol(carePlanId);
  const {
    defaultPaymentMethod,
    hasFlexPaymentMethod,
    activePaymentMethodId,
    startSelectingPaymentMethod,
    activePaymentMethod,
    isFlexSelected,
    isLoading: isPaymentMethodsLoading,
  } = usePaymentMethodSelection();
  const createServiceOrdersMutation = useCreateServiceOrders();
  const completeRevealMutation = useCompleteReveal();
  const { track } = useAnalytics();
  const navigate = useNavigate();

  const serviceItems = useMemo(
    () => revealStatusQuery.data?.reveal.protocolOrder?.serviceItems ?? [],
    [revealStatusQuery.data?.reveal.protocolOrder?.serviceItems],
  );

  // Filter protocol activities to get service activities
  const serviceActivities = useMemo(() => {
    if (!protocolQuery.data?.activities) return [];
    return protocolQuery.data.activities.filter(
      (activity): activity is Extract<typeof activity, { type: 'service' }> =>
        activity.type === 'service' && activity.service !== undefined,
    );
  }, [protocolQuery.data?.activities]);

  // Create a map of service activities by service ID and name for quick lookup
  const serviceActivitiesById = useMemo(
    () =>
      new Map(
        serviceActivities.map((activity) => [
          activity.service.id,
          activity.service,
        ]),
      ),
    [serviceActivities],
  );
  const serviceActivitiesByName = useMemo(
    () =>
      new Map(
        serviceActivities.map((activity) => [
          activity.service.name.toLowerCase(),
          activity.service,
        ]),
      ),
    [serviceActivities],
  );

  const checkoutItems = useMemo<ServiceCheckoutItem[]>(() => {
    return serviceItems.map((item) => {
      const serviceActivity =
        serviceActivitiesById.get(item.serviceId) ??
        serviceActivitiesByName.get(item.serviceName.toLowerCase());

      return {
        id: item.id,
        name: serviceActivity?.name ?? item.serviceName,
        description:
          serviceActivity?.additionalClassification?.[0] ??
          (serviceActivity?.phlebotomy
            ? 'In-person blood draw'
            : 'Speciality Test'),
        price: serviceActivity?.price ?? 0,
        image: getServiceImage(serviceActivity?.name ?? item.serviceName),
      };
    });
  }, [serviceItems, serviceActivitiesById, serviceActivitiesByName]);

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + (item.price || 0), 0),
    [checkoutItems],
  );

  const total = subtotal;

  const handleCompleteWithoutAction = async () => {
    track('protocol_reveal_quit', {
      reason: 'service_checkout_step_quit',
      careplanId: carePlanId,
    });
    try {
      await completeRevealMutation.mutateAsync(carePlanId);
      navigate('/protocol');
    } catch (error) {
      // fall back to navigate
      console.error('Failed to complete reveal', error);
      navigate('/protocol');
    }
  };

  const isLoadingData =
    revealStatusQuery.isLoading ||
    protocolQuery.isLoading ||
    isPaymentMethodsLoading;

  useEffect(() => {
    if (revealStatusQuery.data?.progress.serviceCheckoutCompleted) {
      next();
    }

    if (!isLoadingData && checkoutItems.length === 0) {
      next();
    }
  }, [
    revealStatusQuery.data?.progress.serviceCheckoutCompleted,
    next,
    isLoadingData,
    checkoutItems.length,
  ]);

  if (revealStatusQuery.isError || protocolQuery.isError) {
    return (
      <CheckoutLayout step={REVEAL_STEPS.SERVICE_CHECKOUT}>
        <div className="col-span-2 mx-auto w-full max-w-md space-y-6 px-6 text-center">
          <H3>We couldn&apos;t load your order</H3>
          <Body1 className="text-secondary">
            Please refresh the page or try again later.
          </Body1>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                revealStatusQuery.refetch();
                protocolQuery.refetch();
              }}
            >
              Try again
            </Button>
            <Button variant="outline" onClick={previous}>
              Back
            </Button>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  const handleConfirm = async () => {
    if (!activePaymentMethod?.externalPaymentMethodId) {
      return;
    }

    try {
      await createServiceOrdersMutation.mutateAsync({
        carePlanId,
        paymentMethodId: activePaymentMethod.externalPaymentMethodId,
      });
      await queryClient.invalidateQueries({
        queryKey: getRevealStatusQueryKey(carePlanId),
      });
      next();
    } catch (error) {
      console.error(error);
      toast.error(
        'We were unable to process your payment. Please verify your card or try again.',
      );
    }
  };

  const showPaymentForm = checkoutItems.length > 0;
  const hasPaymentMethod = Boolean(defaultPaymentMethod);

  if (isLoadingData) {
    return (
      <CheckoutLayout step={REVEAL_STEPS.SERVICE_CHECKOUT}>
        <div className="col-span-2 mx-auto w-full px-6 text-center lg:max-w-md">
          <div className="flex min-h-[180px] items-center justify-center">
            <Spinner variant="primary" />
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout step={REVEAL_STEPS.SERVICE_CHECKOUT}>
      <div className="mb-8 flex-1 space-y-4 rounded-3xl border-zinc-100 lg:mb-0 lg:border lg:bg-white lg:p-8">
        <H4 className="hidden lg:block">Checkout</H4>
        <div className="space-y-2">
          {checkoutItems.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <Body2 className="text-secondary">No items selected.</Body2>
            </div>
          )}
          {checkoutItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="size-16 rounded-xl object-cover object-center"
              />
              <div className="flex-1 space-y-0.5">
                <Body1 className="font-semibold">{item.name}</Body1>
                {item.description ? (
                  <Body2 className="text-secondary">{item.description}</Body2>
                ) : null}
              </div>
              <div className="text-right">
                <Body1 className="font-semibold">
                  {formatMoney(item.price)}
                </Body1>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-xl p-4 pb-0">
          <div className="flex items-center justify-between rounded-xl">
            <Body1 className="text-secondary">Total</Body1>
            <Body1>{formatMoney(total)}</Body1>
          </div>
        </div>
      </div>

      <div className="w-full space-y-8">
        <div className="hidden space-y-3 lg:block">
          <H3>Purchase Testing</H3>
          <Body1 className="text-secondary">
            Pay securely using your saved card or add a new one. HSA/FSA is
            supported when available.
          </Body1>
        </div>

        {showPaymentForm && (
          <div className="space-y-3">
            <Body2 className="text-secondary">Payment</Body2>
            {hasPaymentMethod ? (
              <CurrentPaymentMethodCard
                className="bg-white"
                error={
                  createServiceOrdersMutation.isError
                    ? 'There was an issue with your payment method. Please try another card.'
                    : undefined
                }
              />
            ) : (
              <CreatePaymentMethodForm />
            )}
            {hasPaymentMethod &&
              hasFlexPaymentMethod &&
              !activePaymentMethodId && (
                <Button
                  variant="outline"
                  className="w-full bg-white"
                  onClick={startSelectingPaymentMethod}
                >
                  <CircleCheckBig className="mr-2 size-[20px] text-zinc-700" />
                  Select HSA/FSA card
                </Button>
              )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            className={cn(
              'w-full sm:flex-1',
              (checkoutItems.length === 0 || !hasPaymentMethod) && 'hidden',
            )}
            onClick={handleConfirm}
            disabled={
              !activePaymentMethod?.externalPaymentMethodId ||
              createServiceOrdersMutation.isPending ||
              completeRevealMutation.isPending
            }
          >
            {createServiceOrdersMutation.isPending ? (
              <TransactionSpinner className="flex justify-center" />
            ) : (
              <>
                {isFlexSelected && (
                  <CircleCheckBig className="mr-2 size-[20px]" />
                )}
                Purchase{isFlexSelected ? ' with HSA/FSA' : ''}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="bg-white"
            onClick={handleCompleteWithoutAction}
            disabled={
              completeRevealMutation.isPending ||
              createServiceOrdersMutation.isPending
            }
          >
            I don’t want to act on my results yet
          </Button>
        </div>
      </div>
    </CheckoutLayout>
  );
};
