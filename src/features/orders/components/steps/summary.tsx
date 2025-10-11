import { CircleCheckBig } from 'lucide-react';
import moment from 'moment';
import { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useCreateOrder, useUpdateOrder } from '@/features/orders/api';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { OrderAppointmentDetails } from '@/features/orders/components/order-appointment-details';
import { HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE } from '@/features/orders/const/config';
import { useHasCredit } from '@/features/orders/hooks';
import { useOrder } from '@/features/orders/stores/order-store';
import { useService } from '@/features/services/api';
import { CreatePaymentMethodForm } from '@/features/settings/components/billing/create-payment-method-form';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { CurrentPaymentMethodCard } from '@/features/users/components/current-payment-method-card';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

export function OrderSummary(): ReactNode {
  const {
    service,
    location,
    slot,
    collectionMethod,
    tz,
    addOnIds,
    buildCreateOrderData,
    buildUpdateOrderData,
    onSuccess,
  } = useOrder((s) => s);
  const { nextStep, prevStep } = useStepper((s) => s);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | undefined
  >();

  const createOrderMutation = useCreateOrder({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
      },
    },
  });
  const updateOrderMutation = useUpdateOrder({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
      },
    },
  });

  const isMutationLoading =
    createOrderMutation.isPending || updateOrderMutation.isPending;

  const {
    paymentMethodsQuery,
    defaultPaymentMethod,
    isFlexSelected,
    hasFlexPaymentMethod,
    setProcessingPaymentType,
    isProcessingDefault,
    isProcessingFlex,
    primaryPaymentMethodId,
    flexPaymentMethodId,
  } = usePaymentMethodSelection(selectedPaymentMethodId, isMutationLoading);

  const serviceQuery = useService({
    serviceId: service.id,
    addOnServiceIds: addOnIds.size > 0 ? [...addOnIds] : undefined,
    method: collectionMethod,
  });
  const { isCreditLoading, credit } = useHasCredit({
    serviceName: service.name,
  });

  const isQueryLoading =
    serviceQuery.isLoading || isCreditLoading || paymentMethodsQuery.isLoading;

  const price = serviceQuery.data?.service.price;

  const createOrderFn = async (
    paymentType: 'stripe' | 'flex',
  ): Promise<void> => {
    if (service === null)
      throw Error('There was a problem creating the order.');

    setProcessingPaymentType(paymentType);
    const data = buildCreateOrderData();
    data.paymentMethodId =
      paymentType === 'flex' ? flexPaymentMethodId : primaryPaymentMethodId;

    try {
      const response = await createOrderMutation.mutateAsync({ data });
      if (response.order) {
        nextStep();
      }
    } finally {
      setProcessingPaymentType(null);
    }
  };

  const updateOrderFn = async (
    paymentType: 'stripe' | 'flex',
  ): Promise<void> => {
    if (!credit) {
      toast('No orderId found for previous order. Contact support.');
      return;
    }

    setProcessingPaymentType(paymentType);
    const data = buildUpdateOrderData();
    data.paymentMethodId =
      paymentType === 'flex' ? flexPaymentMethodId : primaryPaymentMethodId;

    try {
      await updateOrderMutation.mutateAsync({
        orderId: credit.id,
        data,
      });
      nextStep();
    } finally {
      setProcessingPaymentType(null);
    }
  };

  return (
    <>
      <div
        className={cn('space-y-8', HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE)}
      >
        <div className="space-y-1">
          <H2>Order Summary</H2>
          {process.env.NODE_ENV === 'development' ? (
            <Body2 className="text-pink-700">
              DEBUG (not visible in prod):&nbsp;
              {credit
                ? `using existing draft order ${credit.id}`
                : 'creating new order, no existing credit found'}
            </Body2>
          ) : null}
          <Body1 className="text-secondary">
            Confirm your order details below.
          </Body1>
        </div>
        {isQueryLoading ? (
          <>
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-[130px] w-full rounded-2xl" />
          </>
        ) : null}
        {defaultPaymentMethod && !isQueryLoading ? (
          <div className="space-y-6 md:space-y-10">
            <CreateOrderSummaryItem price={price} />
            <OrderAppointmentDetails
              collectionMethod={collectionMethod ?? undefined}
              slot={slot ?? undefined}
              timezone={tz ?? moment.tz.guess()}
              location={location ?? undefined}
              isPhlebotomy={service.phlebotomy}
              serviceName={service.name}
              supportsLabOrder={service.supportsLabOrder}
              selectedPanels={[...addOnIds, ...(credit?.addOnServiceIds ?? [])]}
            />
            {price && price > 0 ? (
              <CurrentPaymentMethodCard
                selectedPaymentMethodId={selectedPaymentMethodId}
                onPaymentMethodSelect={setSelectedPaymentMethodId}
              />
            ) : null}
          </div>
        ) : null}
        {!defaultPaymentMethod && !isQueryLoading ? (
          <div className="space-y-4">
            <H2>We do not have your payment method!</H2>
            <CreatePaymentMethodForm />
          </div>
        ) : null}
      </div>
      <HealthcareServiceFooter
        prevBtn={
          <Button
            variant={hasFlexPaymentMethod ? 'white' : 'outline'}
            className="w-full bg-white md:w-auto"
            onClick={prevStep}
            disabled={isMutationLoading}
          >
            Back
          </Button>
        }
        nextBtn={
          <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-2">
            {hasFlexPaymentMethod && price !== undefined && price > 0 && (
              <Button
                variant="outline"
                className="w-full bg-white md:w-auto"
                disabled={
                  !isFlexSelected ||
                  isMutationLoading ||
                  price === undefined ||
                  isQueryLoading
                }
                onClick={() =>
                  credit ? updateOrderFn('flex') : createOrderFn('flex')
                }
              >
                {isProcessingFlex ? (
                  <TransactionSpinner
                    variant="primary"
                    className="flex justify-center"
                  />
                ) : (
                  <>
                    <CircleCheckBig className="mr-2 size-[20px] text-zinc-700" />
                    {isFlexSelected
                      ? 'Confirm with HSA/FSA'
                      : 'Select an HSA/FSA card'}
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={() =>
                credit ? updateOrderFn('stripe') : createOrderFn('stripe')
              }
              className="w-full md:w-auto"
              disabled={
                isMutationLoading ||
                price === undefined ||
                isQueryLoading ||
                !primaryPaymentMethodId
              }
            >
              {isProcessingDefault ? (
                <TransactionSpinner className="flex justify-center" />
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        }
      />
    </>
  );
}

function CreateOrderSummaryItem({
  price,
  isLoading = false,
}: {
  price?: number;
  isLoading?: boolean;
}): ReactNode {
  const { service } = useOrder((s) => s);
  return (
    <div className="flex items-center justify-between gap-2 rounded-[20px] border border-zinc-200 bg-white px-5 py-3 shadow shadow-black/[.03] sm:flex-row">
      <div className="flex items-center gap-3">
        <img
          src={getServiceImage(service.name)}
          alt={service.name}
          className="size-16 rounded-xl object-cover object-center"
        />
        <div className="space-y-0.5">
          <Body1>{service.name}</Body1>
          <Body2 className="line-clamp-3 text-zinc-400">
            {service.description}
          </Body2>
        </div>
      </div>
      {isLoading ? <Skeleton className="h-6 w-full" /> : null}
      {price && price > 0 ? <Body1>{formatMoney(price)}</Body1> : null}
    </div>
  );
}
