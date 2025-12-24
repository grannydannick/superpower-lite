import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useCredits } from '@/features/orders/api/credits';
import { useUpgradeCreditPrice } from '@/features/orders/api/credits/get-upgrade-credit-price';
import { SHARED_CONTAINER_STYLE } from '@/features/orders/const/config';
import { useScheduleStore } from '@/features/orders/stores/schedule-store';
import { useServices } from '@/features/services/api';
import { CreatePaymentMethodForm } from '@/features/settings/components/billing/create-payment-method-form';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment';
import { cn } from '@/lib/utils';
import { getServiceImage } from '@/utils/service';

import { useCreateOrder, useUpgradeCredit } from '../../../api';
import { AppointmentDetails } from '../../appointment-details';
import { ScheduleFlowFooter } from '../schedule-flow-footer';
import { useScheduleFlowStepper } from '../schedule-stepper';

export function ScheduleSummaryStep(): ReactNode {
  const {
    location,
    slot,
    collectionMethod,
    tz,
    mode,
    selectedCreditIds,
    buildCreateOrderData,
    onSuccess,
  } = useScheduleStore((s) => s);
  const { next, prev } = useScheduleFlowStepper();

  const createOrderMutation = useCreateOrder({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
      },
    },
  });
  const upgradeCreditMutation = useUpgradeCredit();

  const isMutationLoading =
    createOrderMutation.isPending || upgradeCreditMutation.isPending;
  const {
    isLoading: isPaymentMethodsLoading,
    defaultPaymentMethod,
    activePaymentMethod,
  } = usePaymentMethodSelection();
  const { isLoading: isUpgradePriceLoading, data: upgradePriceData } =
    useUpgradeCreditPrice({
      upgradeType: 'at-home',
      creditIds: [...selectedCreditIds],
    });

  const isQueryLoading = isPaymentMethodsLoading || isUpgradePriceLoading;

  const price =
    collectionMethod === 'AT_HOME' ? upgradePriceData?.price ?? 0 : 0;

  const createOrderFn = async (): Promise<void> => {
    const data = buildCreateOrderData();
    data.paymentMethodId = activePaymentMethod?.externalPaymentMethodId;

    if (collectionMethod === 'AT_HOME') {
      await upgradeCreditMutation.mutateAsync({
        data: {
          upgradeType: 'at-home',
          paymentMethodId: activePaymentMethod?.externalPaymentMethodId,
          creditIds: [...selectedCreditIds],
        },
      });
    }

    const response = await createOrderMutation.mutateAsync({ data });
    if (response.requestGroup) {
      next();
    }
  };

  return (
    <>
      <div className={cn('space-y-8', SHARED_CONTAINER_STYLE)}>
        <div className="space-y-1">
          <H2>Confirm your testing location & date</H2>
          <Body1 className="text-secondary">
            Confirm your testing details below.
          </Body1>
        </div>
        {isQueryLoading ? (
          <>
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-[130px] w-full rounded-2xl" />
          </>
        ) : null}
        {!isQueryLoading && (defaultPaymentMethod || price === 0) ? (
          <div className="space-y-6 md:space-y-10">
            <ScheduleSummaryItems />
            <AppointmentDetails
              collectionMethod={collectionMethod ?? undefined}
              slot={slot ?? undefined}
              timezone={tz ?? undefined}
              location={location ?? undefined}
              isAdvisory={mode === 'advisory-call'}
              price={price}
            />
            {price > 0 && defaultPaymentMethod ? (
              <CurrentPaymentMethodCard />
            ) : null}
          </div>
        ) : null}
        {!defaultPaymentMethod && !isQueryLoading && price > 0 ? (
          <div className="space-y-4">
            <H2>We do not have your payment method!</H2>
            <CreatePaymentMethodForm showCancelButton={false} />
          </div>
        ) : null}
      </div>
      <ScheduleFlowFooter
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
            onClick={createOrderFn}
            className="w-full"
            disabled={
              isMutationLoading ||
              isQueryLoading ||
              (price > 0 && !activePaymentMethod?.externalPaymentMethodId)
            }
          >
            {isMutationLoading ? (
              <TransactionSpinner className="flex justify-center" />
            ) : (
              <>Confirm</>
            )}
          </Button>
        }
      ></ScheduleFlowFooter>
    </>
  );
}

function ScheduleSummaryItems(): ReactNode {
  const servicesQuery = useServices();
  const creditsQuery = useCredits();
  const selectedCreditIds = useScheduleStore((s) => s.selectedCreditIds);

  const services = servicesQuery.data?.services ?? [];
  const credits = creditsQuery.data?.credits ?? [];
  const ownedCredits = credits.filter((s) => selectedCreditIds.has(s.id));

  return (
    <div className="flex flex-col rounded-[20px] border border-zinc-200 bg-white p-5 shadow shadow-black/[.03]">
      {ownedCredits.map((c, i) => {
        const s = services.find((s) => s.id === c.serviceId);
        if (!s) return;

        return (
          <>
            <div className="flex items-center gap-3" key={s.id}>
              <img
                src={getServiceImage(s.name)}
                alt={s.name}
                className="size-16 rounded-xl object-cover object-center"
              />
              <div className="space-y-0.5">
                <Body1>{s.name}</Body1>
                <Body2 className="line-clamp-3 text-zinc-400">
                  {s.bloodTubeCount
                    ? `${s.bloodTubeCount} vials`
                    : s.description}
                </Body2>
              </div>
            </div>
            {i !== ownedCredits.length - 1 ? (
              <Separator className="my-4" />
            ) : null}
          </>
        );
      })}
      {servicesQuery.isLoading ? <Skeleton className="h-16 w-full" /> : null}
    </div>
  );
}
