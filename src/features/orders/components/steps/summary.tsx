import { CircleCheckBig } from 'lucide-react';
import moment from 'moment';
import { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useCreateOrder, useUpdateOrder } from '@/features/orders/api';
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
  const [isSelectingPaymentMethod, setIsSelectingPaymentMethod] =
    useState(false);

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
    activePaymentMethod,
  } = usePaymentMethodSelection(selectedPaymentMethodId);

  const handlePaymentMethodSelect = (id: string) => {
    setSelectedPaymentMethodId(id);
    setIsSelectingPaymentMethod(false);
  };

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

  const createOrderFn = async (): Promise<void> => {
    if (service === null)
      throw Error('There was a problem creating the order.');

    const data = buildCreateOrderData();
    data.paymentMethodId = activePaymentMethod?.externalPaymentMethodId;

    const response = await createOrderMutation.mutateAsync({ data });
    if (response.order) {
      nextStep();
    }
  };

  const updateOrderFn = async (): Promise<void> => {
    if (!credit) {
      toast('No orderId found for previous order. Contact support.');
      return;
    }

    const data = buildUpdateOrderData();
    data.paymentMethodId = activePaymentMethod?.externalPaymentMethodId;

    await updateOrderMutation.mutateAsync({
      orderId: credit.id,
      data,
    });
    nextStep();
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
                onPaymentMethodSelect={handlePaymentMethodSelect}
                isEditing={isSelectingPaymentMethod}
                setIsEditing={setIsSelectingPaymentMethod}
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
      <div className="bottom-0 z-50 flex items-center px-6 py-4 md:py-8 md:px-16 [.overflow-auto_&]:sticky [.overflow-y-scroll_&]:sticky">
        <div className="flex w-full flex-col-reverse justify-end gap-4 md:flex-row md:gap-2">
          <Button
            variant="outline"
            className="w-full bg-white md:w-auto"
            onClick={prevStep}
            disabled={isMutationLoading}
          >
            Back
          </Button>
          <Button
            variant="outline"
            className={cn(
              'w-full bg-white md:w-auto',
              (!hasFlexPaymentMethod ||
                selectedPaymentMethodId ||
                price === undefined ||
                price <= 0) &&
                'hidden',
            )}
            onClick={() => setIsSelectingPaymentMethod(true)}
          >
            <CircleCheckBig className="mr-2 size-[20px] text-zinc-700" />
            Select HSA/FSA card
          </Button>
          <Button
            onClick={credit ? updateOrderFn : createOrderFn}
            className="w-full md:w-auto"
            disabled={
              isMutationLoading ||
              price === undefined ||
              isQueryLoading ||
              !activePaymentMethod?.externalPaymentMethodId
            }
          >
            {isMutationLoading ? (
              <TransactionSpinner className="flex justify-center" />
            ) : (
              <>
                {isFlexSelected && (
                  <CircleCheckBig className="mr-2 size-[20px]" />
                )}
                Confirm{isFlexSelected ? ' with HSA/FSA' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
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
