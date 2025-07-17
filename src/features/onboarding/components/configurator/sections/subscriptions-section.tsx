import React, { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
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
  ...rest
}) => {
  const adjustedSubtotal = React.useMemo(() => {
    const { subtotal, coupon } = availableSubscription;
    let discountedPrice = subtotal;

    if (coupon?.percent_off) {
      discountedPrice *= 1 - coupon.percent_off / 100;
    }

    if (coupon?.amount_off) {
      discountedPrice = Math.max(0, discountedPrice - coupon.amount_off);
    }

    return discountedPrice;
  }, [availableSubscription]);

  return (
    <div
      className={cn(
        'flex flex-row items-center rounded-2xl bg-white border border-zinc-200 p-4 sm:px-6 sm:py-4 cursor-pointer transition-all duration-150',
      )}
      {...rest}
    >
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row gap-x-4">
          <div>
            <div className="flex flex-col-reverse gap-1.5 sm:flex-row">
              <Body1 className="capitalize text-zinc-900">
                {availableSubscription.type} Membership
              </Body1>
              {availableSubscription.type === 'advanced' && (
                <Badge className="w-fit" variant="vermillion">
                  Most popular
                </Badge>
              )}
            </div>

            <Body2 className="text-zinc-500">
              {availableSubscription.description}
            </Body2>
          </div>
        </div>
        <div className="flex flex-row items-center gap-x-4">
          {adjustedSubtotal === 0 ? (
            <Body2 className="text-zinc-500">Included</Body2>
          ) : (
            <div className="flex items-center gap-1">
              {Object.keys(availableSubscription.coupon).length > 0 ? (
                <div className="flex items-center gap-1">
                  <H4 className="text-vermillion-900 line-through">
                    {formatMoney(availableSubscription.subtotal)}
                  </H4>
                  <H4>{formatMoney(adjustedSubtotal)}</H4>
                </div>
              ) : (
                <H4>{formatMoney(adjustedSubtotal)}</H4>
              )}
            </div>
          )}

          <RadioGroupItem value={availableSubscription.type} />
        </div>
      </div>
    </div>
  );
};

export const SubscriptionsSection = () => {
  const membership = useOnboarding((s) => s.membership);
  const updateMembership = useOnboarding((s) => s.updateMembership);
  const coupon = useOnboarding((s) => s.coupon);

  const availableSubscriptionsQuery = useAvailableSubscriptions({
    code: coupon ?? undefined,
  });

  const availableSubscriptions = availableSubscriptionsQuery.data ?? [];

  // NOTE: this just assigns default subscription on load
  useEffect(() => {
    if (availableSubscriptions.length > 0) {
      updateMembership(availableSubscriptions[0]);
    } else {
      updateMembership(null);
    }
  }, [availableSubscriptions]);

  return (
    <section id="subscriptions" className="w-full space-y-6">
      <div className="space-y-2">
        <H3 className="text-[#1E1E1E]">Your annual membership</H3>
        <Body2 className="text-zinc-500">
          Your Superpower membership package details.
        </Body2>
      </div>
      <div className="space-y-2">
        <RadioGroup
          value={membership?.type ?? 'baseline'}
          // hide radio buttons if there is only one subscription = no need to select
          className={cn(
            availableSubscriptions.length === 1 && '[&_[role=radio]]:hidden',
          )}
          aria-hidden={availableSubscriptions.length === 1}
        >
          {availableSubscriptionsQuery.isLoading
            ? Array(1)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))
            : null}
          {availableSubscriptions.map((as, i) => (
            <SubscriptionCard
              key={i}
              availableSubscription={as}
              selected={as.type === membership?.type}
              onClick={() => updateMembership(as)}
            />
          ))}
          {availableSubscriptions.length === 0 &&
          !availableSubscriptionsQuery.isLoading ? (
            <div className="flex h-[78px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white p-4 sm:px-6 sm:py-4">
              No available subscriptions found. Contact support.
            </div>
          ) : null}
        </RadioGroup>
      </div>
    </section>
  );
};
