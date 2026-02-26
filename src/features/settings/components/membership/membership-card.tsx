import { cva } from 'class-variance-authority';
import { format } from 'date-fns';
import React from 'react';

import { Hover3D } from '@/components/ui/hover-3d';
import { H2 } from '@/components/ui/typography';
import { useSubscriptions } from '@/features/settings/api';
import { BiologicalAgeInfo } from '@/features/settings/components/membership/bio-age-info';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

const membershipCardVariants = cva(
  'flex w-full flex-col justify-between rounded-xl border border-white/10 p-6 md:h-72 md:rounded-2xl',
  {
    variants: {
      isActive: {
        true: 'bg-baseline-membership',
        false: 'bg-baseline-membership grayscale',
      },
      isLoading: {
        true: 'animate-pulse bg-muted',
        false: '',
      },
    },
  },
);

export const MembershipCard = () => {
  const { data: user } = useUser();
  const { data: subscriptionsData, isLoading } = useSubscriptions({});

  const superpowerMembership = subscriptionsData?.subscriptions.find(
    (subscription) => subscription.name === 'membership',
  );

  if (!user) {
    return <div className="md:p-16">No profile information found.</div>;
  }

  const { firstName, lastName, createdAt } = user;

  // if user has ACTIVE subscription
  // if user has CANCELED subscription AND current_date < end_date
  const isActive = superpowerMembership
    ? superpowerMembership.status === 'active' ||
      (superpowerMembership?.status === 'canceled' &&
        new Date() < new Date(superpowerMembership?.current_period_end * 1000))
    : false;

  return (
    <div
      className={cn(
        `mx-auto flex w-full items-center justify-center lg:max-w-[450px]`,
        !isActive && !isLoading && 'opacity-50',
      )}
    >
      <Hover3D
        className={cn(
          'flex aspect-[5/3.15] w-full max-w-[calc(100vw-4rem)] flex-col justify-between rounded-xl border border-white/10 bg-cover p-6 md:h-72 md:rounded-2xl',
          membershipCardVariants({
            isActive,
            isLoading,
          }),
        )}
        options={{
          resetOnHover: true,
          resetDuration: 500,
          shadow: {
            opacity: 0.1,
          },
        }}
        disabled={isLoading || !isActive}
      >
        <div className="flex aspect-[5/3.15] w-full flex-col justify-between pb-4">
          <div className="relative z-10">
            <H2 className="text-white">
              {firstName} {lastName}
            </H2>
          </div>

          <div className="relative z-10 flex flex-row justify-between gap-8">
            <div className="flex items-end">
              <span className="text-sm text-white xs:text-lg">
                Since {format(new Date(createdAt), 'yyyy')}
              </span>
            </div>
            <BiologicalAgeInfo />
          </div>
        </div>
      </Hover3D>
    </div>
  );
};
