import moment from 'moment';
import React, { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  CreateOrderInput,
  UpdateOrderInput,
  useCreateOrder,
  useOrders,
  useUpdateOrder,
} from '@/features/orders/api';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { OrderAppointmentDetails } from '@/features/orders/components/order-appointment-details';
import { useOrder } from '@/features/orders/stores/order-store';
import { useService } from '@/features/services/api';
import { usePaymentMethods } from '@/features/settings/api';
import { CreatePaymentMethodForm } from '@/features/settings/components/billing/create-payment-method-form';
import { CurrentPaymentMethodCard } from '@/features/users/components/current-payment-method-card';
import { useEventDraw } from '@/hooks/use-event-draw';
import { useStepper } from '@/lib/stepper';
import { OrderStatus } from '@/types/api';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

export function OrderSummary(): ReactNode {
  const {
    service,
    items,
    location,
    slot,
    collectionMethod,
    tz,
    informedConsent,
    updateCreatedOrderId,
  } = useOrder((s) => s);
  const { nextStep, prevStep } = useStepper((s) => s);

  const ordersQuery = useOrders({
    queryConfig: { refetchOnMount: 'always' },
  });
  const paymentMethodsQuery = usePaymentMethods();

  const serviceQuery = useService({
    serviceId: service.id,
    method: collectionMethod,
    items,
    queryConfig: {
      refetchOnMount: 'always',
    },
  });

  const defaultPaymentMethod = paymentMethodsQuery.data?.paymentMethods.find(
    (pm) => pm.default,
  );

  const existingDraftOrder = ordersQuery.data?.orders
    .filter((o) => o.status === OrderStatus.draft)
    .find((o) => o.serviceId === service.id);

  const { isEventDrawUser } = useEventDraw();

  const price = serviceQuery.data?.service.price;

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder({
    mutationConfig: {
      onSettled: () => {
        // Use setTimeout to ensure the component has time to process the query invalidation
        setTimeout(() => {
          nextStep();
        }, 50);
      },
    },
  });

  const isMutationLoading =
    createOrderMutation.isPending || updateOrderMutation.isPending;

  const isQueryLoading =
    serviceQuery.isLoading ||
    ordersQuery.isLoading ||
    paymentMethodsQuery.isLoading;

  const createOrderFn = async (): Promise<void> => {
    if (service === null)
      throw Error('There was a problem creating the order.');

    const data = buildCreateOrderData();
    const response = await createOrderMutation.mutateAsync({ data });

    if (response.order) {
      updateCreatedOrderId(response.order.id);
      nextStep();
    }
  };

  const updateOrderFn = async (): Promise<void> => {
    if (!existingDraftOrder) {
      toast('No orderId found for previous order. Contact support.');
      return;
    }

    const data = buildUpdateOrderData();
    await updateOrderMutation.mutateAsync({
      orderId: existingDraftOrder.id,
      data,
    });
  };

  const buildCreateOrderData = (): CreateOrderInput => {
    const data: CreateOrderInput = {
      serviceId: service.id,
      items,
      location: location ? location : {},
      timestamp: slot ? slot.start : new Date().toISOString(),
      timezone: tz || moment.tz.guess(),
      method: collectionMethod ? [collectionMethod] : [],
    };

    if (informedConsent) {
      data.informedConsent = { agreedAt: new Date().toISOString() };
    }

    return data;
  };

  const buildUpdateOrderData = (): UpdateOrderInput => {
    const orderStatus = isEventDrawUser
      ? OrderStatus.active
      : OrderStatus.pending;

    const finalLocation = isEventDrawUser
      ? existingDraftOrder?.location || {}
      : location || {};

    const finalTimezone = isEventDrawUser
      ? existingDraftOrder?.timezone || 'UTC'
      : tz || moment.tz.guess();

    const finalTimestamp = slot ? slot.start : new Date().toISOString();

    const data: UpdateOrderInput = {
      location: finalLocation,
      timezone: finalTimezone,
      method: collectionMethod || undefined,
      status: orderStatus,
    };

    if (!isEventDrawUser) {
      data.timestamp = finalTimestamp;
    }

    if (informedConsent) {
      data.informedConsent = { agreedAt: new Date().toISOString() };
    }

    return data;
  };

  return (
    <>
      <div className="space-y-4 p-6 md:space-y-8 md:p-14">
        <H2>Order Summary</H2>
        {isQueryLoading ? (
          <>
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-[130px] w-full rounded-2xl" />
          </>
        ) : null}
        {defaultPaymentMethod && !isQueryLoading ? (
          <>
            {price !== undefined ? (
              <CreateOrderSummaryItem
                basePrice={price}
                collectionMethod={collectionMethod ?? undefined}
              />
            ) : null}
            <OrderAppointmentDetails
              collectionMethod={collectionMethod ?? undefined}
              slot={slot ?? undefined}
              timezone={tz ?? moment.tz.guess()}
              location={location ?? undefined}
              isPhlebotomy={service.phlebotomy}
              serviceName={service.name}
            />
            {price && price > 0 ? <CurrentPaymentMethodCard /> : null}
          </>
        ) : null}
        {!defaultPaymentMethod && !isQueryLoading ? (
          <div className="space-y-4">
            <H2>We do not have your payment method!</H2>
            <CreatePaymentMethodForm />
          </div>
        ) : null}
      </div>
      {defaultPaymentMethod ? (
        <HealthcareServiceFooter
          prevBtn={
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={prevStep}
              disabled={isMutationLoading}
            >
              Back
            </Button>
          }
          nextBtn={
            <Button
              onClick={existingDraftOrder ? updateOrderFn : createOrderFn}
              className="w-full md:w-auto"
              disabled={
                isMutationLoading || price === undefined || isQueryLoading
              }
            >
              {isMutationLoading ? (
                <TransactionSpinner className="flex justify-center" />
              ) : (
                'Confirm'
              )}
            </Button>
          }
        />
      ) : null}
    </>
  );
}

function CreateOrderSummaryItem({
  basePrice,
  collectionMethod: propCollectionMethod,
}: {
  basePrice: number;
  collectionMethod?: string;
}): ReactNode {
  const { service, collectionMethod: storeCollectionMethod } = useOrder(
    (s) => s,
  );
  const collectionMethod = propCollectionMethod || storeCollectionMethod;

  return (
    <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
      <div className="flex w-full flex-col gap-4 rounded-2xl border border-zinc-200 p-6 md:flex-row md:items-center md:border-none md:p-0">
        <img
          src={getServiceImage(service.name)}
          alt={service.name}
          className="size-12 rounded-xl border border-zinc-200 object-cover object-center"
        />
        <div>
          <Body1>{service.name}</Body1>
          <div className="flex items-center gap-2">
            {service.phlebotomy && (
              <>
                <Body2 className="text-zinc-400">
                  {collectionMethod === 'IN_LAB'
                    ? 'In person lab'
                    : 'At home visit'}
                </Body2>
              </>
            )}
          </div>
        </div>
        {basePrice > 0 ? (
          <div className="flex gap-2 md:hidden">
            Total: <Price basePrice={basePrice} />
          </div>
        ) : null}
      </div>
      <div className="hidden text-nowrap md:block">
        <Price basePrice={basePrice} />
      </div>
    </div>
  );
}

const Price = ({ basePrice }: { basePrice: number }) => {
  return basePrice > 0 ? <Body1>{formatMoney(basePrice)}</Body1> : null;
};
