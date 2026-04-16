import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import React from 'react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { H4 } from '@/components/ui/typography';
import { useSubscriptions } from '@/features/settings/api';
import { cn } from '@/lib/utils';

import { CancelMembershipDialog } from './cancel-membership-dialog';

export const CurrentMembership = () => {
  const { data: subscriptionsData, isLoading } = useSubscriptions();
  const superpowerMembership = subscriptionsData?.subscriptions.find(
    (subscription) => subscription.name === 'membership',
  );
  const canManageMembership =
    superpowerMembership?.status === 'active' ||
    superpowerMembership?.status === 'trialing';

  // Stripe keeps `status === 'active'` during the grace period of a cancellation that's
  // scheduled at period end. Treat the pending-cancel state the same as `canceled` for
  // display so members see "End date" instead of "Renewal Date" while they still have access.
  const isPendingCancel = superpowerMembership?.cancel_at_period_end === true;
  const isCanceled =
    superpowerMembership?.status === 'canceled' || isPendingCancel;
  // For the "End date" / "Renewal Date" label: prefer `cancel_at` when scheduled (the actual
  // future end of the sub), else fall back to `current_period_end`. Deliberately do NOT fall
  // back to `canceled_at` — Stripe sets that to when the cancellation was *requested*, not
  // when the subscription ends; using it here would regress the label to the click time.
  const endTimestamp =
    superpowerMembership?.cancel_at ??
    superpowerMembership?.current_period_end ??
    null;

  return (
    <div className="rounded-2xl lg:flex lg:flex-row lg:items-center lg:justify-between lg:bg-white lg:p-4">
      <div className="hidden space-y-1 lg:block">
        <H4 className="text-zinc-400">Current Membership</H4>
      </div>

      {isLoading ? (
        <Skeleton className="h-[96px] w-full rounded-xl lg:w-[377px]" />
      ) : (
        <div className="flex flex-row gap-x-2">
          <Card className="w-full rounded-2xl px-5 py-4 shadow-none lg:bg-transparent">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-400 md:text-sm">
                {isCanceled ? 'End date' : 'Renewal Date'}
              </span>
              <span className="text-nowrap lg:text-xl">
                {superpowerMembership && endTimestamp
                  ? format(new Date(endTimestamp * 1000), 'PP')
                  : 'Never'}
              </span>
            </div>
          </Card>
          {isCanceled ? (
            <div className="my-3 hidden border-l border-zinc-100 lg:block" />
          ) : null}
          {superpowerMembership ? (
            <CancelMembershipDialog membership={superpowerMembership}>
              <Card
                className={cn(
                  `pointer-events-none w-full rounded-2xl px-5 py-4 shadow-none lg:bg-transparent`,
                  !isCanceled &&
                    canManageMembership &&
                    'pointer-events-auto cursor-pointer',
                )}
              >
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400 md:text-sm">
                    {isCanceled ? 'Canceled at' : 'Manage'}
                  </span>
                  {isCanceled ? (
                    <span className="text-nowrap lg:text-xl">
                      {superpowerMembership?.canceled_at
                        ? format(
                            new Date(superpowerMembership.canceled_at * 1000),
                            'PP',
                          )
                        : 'Scheduled'}
                    </span>
                  ) : (
                    <div className="flex flex-row items-center justify-between gap-x-1.5">
                      <span className="md:text-xl">Membership</span>
                      <ChevronDown className="size-4 shrink-0 text-zinc-400" />
                    </div>
                  )}
                  {!isCanceled && canManageMembership ? (
                    <span className="hidden whitespace-nowrap text-xs text-zinc-400 md:block">
                      Update, cancel, and more
                    </span>
                  ) : null}
                </div>
              </Card>
            </CancelMembershipDialog>
          ) : null}
        </div>
      )}
    </div>
  );
};
