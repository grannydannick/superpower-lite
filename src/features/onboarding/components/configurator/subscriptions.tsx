import { ArrowUpRight } from 'lucide-react';
import React from 'react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useAvailableSubscriptions } from '@/features/settings/api/get-available-subscriptions';
import { cn } from '@/lib/utils';
import { AvailableSubscription } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

interface SubscriptionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  availableSubscription: AvailableSubscription;
  selected: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  availableSubscription,
  selected,
  ...rest
}) => {
  return (
    <div
      className={cn(
        'flex flex-row items-center rounded-xl border border-zinc-200 p-4 sm:px-6 sm:py-5',
        selected ? 'bg-zinc-50' : null,
      )}
      {...rest}
    >
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row gap-x-4">
          <div>
            <div className="flex gap-1.5">
              <Body1 className="capitalize text-zinc-900">
                {availableSubscription.type} Membership
              </Body1>
              {availableSubscription.type === 'advanced' && (
                <div className="rounded-[6px] bg-[#FFEDD5] px-2 py-1 text-[11px] text-[#FC5F2B] sm:text-xs">
                  Most popular
                </div>
              )}
            </div>

            <Body2 className="text-zinc-500">
              {availableSubscription.description}
            </Body2>
          </div>
        </div>
        <div className="flex flex-row items-center gap-x-6">
          <Body2 className="text-zinc-500">
            {formatMoney(availableSubscription.subtotal)}
          </Body2>

          <RadioGroupItem value={availableSubscription.type} />
        </div>
      </div>
    </div>
  );
};

const SectionSubscriptions = () => {
  const membershipType = useOnboarding((s) => s.membershipType);
  const updateMembershipType = useOnboarding((s) => s.updateMembershipType);

  const availableSubscriptionsQuery = useAvailableSubscriptions();

  const availableSubscriptions = availableSubscriptionsQuery.data;

  return (
    <section id="subscriptions" className="w-full space-y-6">
      <div className="space-y-2">
        <H2 className="text-[#1E1E1E]">Customize your membership</H2>
        <p className="text-base text-zinc-500">
          Choose the blood test package would like as part of your membership.
        </p>
        <a
          href="https://superpower.com/biomarkers"
          target="blank"
          rel="noreferrer"
          className="flex flex-row items-center space-x-1 text-[#FC5F2B]"
        >
          <span>Compare and view tests</span>
          <ArrowUpRight className="size-4" />
        </a>
      </div>
      <div className="space-y-2">
        <RadioGroup value={membershipType ?? 'baseline'}>
          {availableSubscriptionsQuery.isLoading
            ? Array(2)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-[86px] w-full" />)
            : null}
          {availableSubscriptions?.map((as, i) => (
            <SubscriptionCard
              key={i}
              availableSubscription={as}
              selected={as.type === membershipType}
              onClick={() => updateMembershipType(as.type)}
            />
          ))}
        </RadioGroup>
      </div>
    </section>
  );
};

export { SectionSubscriptions };
