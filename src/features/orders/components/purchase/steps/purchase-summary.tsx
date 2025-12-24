import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useCreateCredit } from '@/features/orders/api/credits';
import { SHARED_CONTAINER_STYLE } from '@/features/orders/const/config';
import { usePurchaseStore } from '@/features/orders/stores/purchase-store';
import { CreatePaymentMethodForm } from '@/features/settings/components/billing/create-payment-method-form';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

import { PurchaseDialogFooter } from '../purchase-dialog-footer';
import { usePurchaseDialogStepper } from '../purchase-dialog-stepper';

export function PurchaseSummaryStep(): ReactNode {
  const { buildCreateCreditData, service } = usePurchaseStore((s) => s);
  const { prev, next } = usePurchaseDialogStepper();
  const { track } = useAnalytics();

  const createCreditMutation = useCreateCredit();

  const isMutationLoading = createCreditMutation.isPending;
  const {
    isLoading: isPaymentMethodsLoading,
    defaultPaymentMethod,
    activePaymentMethod,
  } = usePaymentMethodSelection();

  const isQueryLoading = isPaymentMethodsLoading;

  const createCreditFn = async (): Promise<void> => {
    const data = buildCreateCreditData();
    data.paymentMethodId = activePaymentMethod?.externalPaymentMethodId;

    const response = await createCreditMutation.mutateAsync({ data });
    if (response.credits) {
      track('marketplace_credits_purchased', {
        value: service.price,
        service: service.name,
        payment_provider:
          activePaymentMethod?.paymentProvider?.toLowerCase() ?? 'unknown',
      });

      next();
    }
  };

  return (
    <>
      <div className={cn('space-y-8', SHARED_CONTAINER_STYLE)}>
        <div className="space-y-1">
          <H2>Checkout</H2>
          <Body1 className="text-secondary">
            Complete your purchase. You can schedule your tests after a
            successfull checkout.
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
            <PurchaseSummaryItems />
            <CurrentPaymentMethodCard />
          </div>
        ) : null}
        {!defaultPaymentMethod && !isQueryLoading ? (
          <div className="space-y-4">
            <H2>We do not have your payment method!</H2>
            <CreatePaymentMethodForm showCancelButton={false} />
          </div>
        ) : null}
      </div>
      <PurchaseDialogFooter
        prevBtn={
          <Button
            variant="outline"
            className="w-full bg-white"
            onClick={prev}
            disabled={isMutationLoading}
          >
            Back
          </Button>
        }
        nextBtn={
          <Button
            onClick={createCreditFn}
            className="w-full"
            disabled={
              isMutationLoading ||
              isQueryLoading ||
              !activePaymentMethod?.externalPaymentMethodId
            }
          >
            {isMutationLoading ? (
              <TransactionSpinner className="flex justify-center" />
            ) : (
              <>Confirm</>
            )}
          </Button>
        }
      ></PurchaseDialogFooter>
    </>
  );
}

function PurchaseSummaryItems(): ReactNode {
  const service = usePurchaseStore((s) => s.service);

  return (
    <div className="flex items-center justify-between rounded-[20px] border border-zinc-200 bg-white p-5 shadow shadow-black/[.03]">
      <div className="flex items-center gap-3">
        <img
          src={getServiceImage(service.name)}
          alt={service.name}
          className="size-16 rounded-xl object-cover object-center"
        />
        <div className="space-y-0.5">
          <Body1>{service.name}</Body1>
          <Body2 className="line-clamp-3 text-zinc-400">
            {service.bloodTubeCount > 0
              ? `${service.bloodTubeCount} vials`
              : service.description}
          </Body2>
        </div>
      </div>
      <Body1>{formatMoney(service.price)}</Body1>
    </div>
  );
}
