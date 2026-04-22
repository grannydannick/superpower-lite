import { capitalize } from '@medplum/core';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  ChevronRight,
  CirclePause,
  CircleX,
  LoaderCircle,
  SlidersHorizontal,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import { useSubscriptions } from '@/features/rx/api/get-subscriptions';
import { ChangePlanDialog } from '@/features/rx/components/change-plan';
import { ChangeRefillDialog } from '@/features/rx/components/change-refill';
import { PauseOrCancelRxSubscriptionDialog } from '@/features/rx/components/pause-or-cancel-rx-subscription';
import { PendingPlanChangeCard } from '@/features/rx/components/pending-plan-change-card';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment';
import { getPrescriptionImage } from '@/utils/prescription';

export const Route = createFileRoute('/_app/rx-subscriptions/$id')({
  component: RxSubscriptionsComponent,
});

function RxSubscriptionsComponent() {
  const { id } = Route.useParams();

  const subscriptionsQuery = useSubscriptions();

  const subscriptions = subscriptionsQuery.data?.data ?? [];

  const subscription = subscriptions.find(
    (s) => s.medicationRequest?.id === id,
  );

  if (!subscription?.medicationRequest) {
    return null;
  }

  const imgUrl = getPrescriptionImage(
    subscription.medicationRequest.medicationDisplay,
  );

  const isPausable =
    subscription.contract.billingCycleStatus !== 'paused' &&
    subscription.contract.billingCycleStatus !== 'cancelled';
  const isCancellable =
    subscription.contract.billingCycleStatus !== 'cancelled';
  const isPlanChangeable =
    subscription.contract.billingCycleStatus !== 'paused' &&
    subscription.contract.billingCycleStatus !== 'cancelled' &&
    subscription.contract.billingCycleStatus !== 'failed' &&
    subscription.contract.billingCycleStatus !== 'attempted';

  const currentPlanLabel = subscription.contract.currentPlanLabel;
  const currentPlanAmount = subscription.contract.currentPlanAmount;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-6 py-9 lg:px-0">
      <div className="space-y-6">
        {/* The bg-zinc-50 helps prevent strobing on transparent images; see comment in progressive-image.tsx */}
        <ProgressiveImage
          src={imgUrl}
          alt={subscription.medicationRequest.medicationDisplay}
          className="h-[337px] w-full rounded-[20px] bg-zinc-50 object-contain"
        />

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <H3 className="text-zinc-900">
                {subscription.medicationRequest.medicationDisplay}
              </H3>
              <Badge
                variant={
                  subscription.medicationRequest.status === 'active'
                    ? 'vermillion'
                    : 'secondary'
                }
              >
                {capitalize(subscription.medicationRequest.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {subscription.contract.anchorDate ? (
                <ChangeRefillDialog subscription={subscription}>
                  <button className="flex w-full items-center justify-between rounded-xl border px-3 py-2">
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <LoaderCircle className="size-4 text-secondary" />
                        <Body2 className="text-secondary">Change refill</Body2>
                      </div>
                      <Body1>
                        {format(
                          new Date(subscription.contract.anchorDate),
                          'MMM do, yyyy',
                        )}
                      </Body1>
                    </div>
                    <ChevronRight className="size-4 text-secondary" />
                  </button>
                </ChangeRefillDialog>
              ) : null}
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Body1>Plan details</Body1>
              <Body1 className="text-secondary">
                {[
                  currentPlanLabel || null,
                  currentPlanAmount || null,
                  `Auto renews on ${
                    subscription.contract.anchorDate
                      ? format(
                          new Date(subscription.contract.anchorDate),
                          'MMM do, yyyy',
                        )
                      : 'your next billing cycle'
                  }`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Body1>
            </div>
            {subscription.contract.pendingBillingCode ? (
              <PendingPlanChangeCard contract={subscription.contract} />
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <H4>Shipping & billing</H4>
        <CurrentPaymentMethodCard />
        <CurrentAddressCard />
        <div className="flex flex-col items-center gap-2 md:flex-row">
          {isPlanChangeable ? (
            <ChangePlanDialog subscription={subscription}>
              <Button variant="outline" className="w-full items-center gap-2">
                <SlidersHorizontal className="size-[18px] text-secondary" />
                Change Plan
              </Button>
            </ChangePlanDialog>
          ) : null}
          {isPausable ? (
            <PauseOrCancelRxSubscriptionDialog
              subscription={subscription}
              flow={'pause'}
            >
              <Button variant="outline" className="w-full items-center gap-2">
                <CirclePause className="size-[18px] text-secondary" />
                Pause Subscription
              </Button>
            </PauseOrCancelRxSubscriptionDialog>
          ) : null}
          {isCancellable ? (
            <PauseOrCancelRxSubscriptionDialog
              subscription={subscription}
              flow={'cancel'}
            >
              <Button variant="outline" className="w-full items-center gap-2">
                <CircleX className="size-[18px] text-secondary" />
                Cancel Subscription
              </Button>
            </PauseOrCancelRxSubscriptionDialog>
          ) : null}
        </div>
      </div>
    </div>
  );
}
