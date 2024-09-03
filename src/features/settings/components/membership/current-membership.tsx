import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import React from 'react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CancelMembershipDialog } from '@/features/settings/components/membership/cancel-membership-dialog';
import { cn } from '@/lib/utils';
import { useSubscriptions } from '@/shared/api/get-subscriptions';

export const CurrentMembership = (): JSX.Element => {
  const { data: subscriptionsData, isLoading } = useSubscriptions({});
  const superpowerMembership = subscriptionsData?.subscriptions.find(
    (subscription) => subscription.name === 'membership',
  );

  return (
    <div className="rounded-2xl lg:flex lg:flex-row lg:items-center lg:justify-between lg:bg-white lg:p-4">
      <h2 className="mx-6 my-3 hidden text-lg text-zinc-400 lg:block">
        Current Membership
      </h2>
      <div className="flex flex-row gap-x-2">
        <Card className="w-full px-5 py-4 shadow-none lg:bg-transparent">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 lg:text-sm">
              {isLoading ? (
                <Skeleton className="h-4 w-full" />
              ) : superpowerMembership?.status === 'canceled' ? (
                'End date'
              ) : (
                'Renewal Date'
              )}
            </span>
            <span className="text-nowrap lg:text-xl">
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : superpowerMembership ? (
                format(
                  new Date(superpowerMembership.current_period_end * 1000),
                  'PP',
                )
              ) : (
                'Never'
              )}
            </span>
          </div>
        </Card>
        <div className="my-3 hidden border-l border-zinc-100 lg:block" />
        <CancelMembershipDialog membership={superpowerMembership}>
          <Card
            className={cn(
              `w-full px-5  shadow-none py-4 lg:bg-transparent pointer-events-none`,
              superpowerMembership?.status === 'active' &&
                'cursor-pointer pointer-events-auto',
            )}
          >
            <div className="flex flex-col">
              <span className="text-xs text-zinc-400 lg:text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-full" />
                ) : superpowerMembership?.status === 'canceled' ? (
                  'Canceled at'
                ) : (
                  'Manage'
                )}
              </span>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : superpowerMembership?.status === 'canceled' &&
                superpowerMembership?.canceled_at ? (
                <span className="text-nowrap lg:text-xl">
                  {format(
                    new Date(superpowerMembership.canceled_at * 1000),
                    'PP',
                  )}
                </span>
              ) : (
                <div className="flex flex-row items-center justify-between gap-x-1.5 lg:min-w-[175px]">
                  <span className="lg:text-xl">Membership</span>
                  <ChevronDown className="size-4 text-zinc-400" />
                </div>
              )}
              {superpowerMembership?.status === 'active' && (
                <span className="hidden whitespace-nowrap text-xs text-zinc-400 lg:block">
                  Update, cancel, and more
                </span>
              )}
            </div>
          </Card>
        </CancelMembershipDialog>
      </div>
    </div>
  );
};
