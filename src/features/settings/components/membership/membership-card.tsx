import { differenceInYears, parseISO } from 'date-fns';
import moment from 'moment';

import { Body1, H2 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useSubscriptions } from '@/shared/api/get-subscriptions';

export const MembershipCard = (): JSX.Element => {
  const { data: user } = useUser();
  const { data: subscriptionsData, isLoading } = useSubscriptions({});

  const superpowerMembership = subscriptionsData?.subscriptions.find(
    (subscription) => subscription.name === 'membership',
  );

  if (!user) {
    return <div className="md:p-16">No profile information found.</div>;
  }

  const { dateOfBirth, firstName, lastName, createdAt } = user;

  const birthDate = parseISO(dateOfBirth);
  const today = new Date();
  const age = differenceInYears(today, birthDate);

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
        `flex items-center justify-center w-full max-w-[400px] lg:max-w-[450px] mx-auto`,
        !isActive && !isLoading && 'opacity-50',
      )}
    >
      <div
        className={cn(
          'text-white flex flex-col justify-between p-5 w-full bg-cover aspect-[5/3.15] bg-membership-card',
          !isActive && !isLoading && 'grayscale',
          isLoading ? 'animate-pulse' : '',
        )}
      >
        <H2 className="text-white">
          {firstName} {lastName}
        </H2>
        <div className="flex flex-row justify-between">
          <div className="flex items-end">
            <span className="text-sm xs:text-lg">
              Since {moment(createdAt).format('YYYY')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <H2 className="text-white">{age}</H2>
            <Body1 className="text-white">Chronological years old</Body1>
          </div>
        </div>
      </div>
    </div>
  );
};
