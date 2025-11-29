import NumberFlow from '@number-flow/react';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ChevronLeft } from '@/components/icons/chevron-left-icon';
import { SuperpowerUserSignature } from '@/components/shared/superpower-user-signature';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import {
  useRevealLatest,
  useCreateProtocolOrder,
  useCompleteReveal,
  type Activity,
  type Goal,
} from '@/features/protocol/api';
import { useProtocolCheckout } from '@/features/protocol/hooks/use-protocol-checkout';
import { getActivityPricing } from '@/features/protocol/utils/get-activity-pricing';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { FeatureFlags } from '@/lib/posthog';
import { cn } from '@/lib/utils';

import { AutopilotCard } from '../../autopilot/autopilot-card';
import { CheckoutItemCard } from '../../checkout/checkout-item-card';
import { ProtocolGoalPriority } from '../../goals/protocol-goal-priority';
import { ProtocolLayout } from '../../layouts/protocol-layout';

type OrderSummaryStepProps = {
  goals?: Goal[];
  activities?: Activity[];
  next: () => void;
  previous: () => void;
};

export function OrderSummaryStep({
  goals,
  activities,
  next,
  previous,
}: OrderSummaryStepProps) {
  const { items, hasItem, addItem, removeItem, getActivityId } =
    useProtocolCheckout();

  const { data, isLoading } = useUser();
  const { data: revealData } = useRevealLatest();
  const createOrderMutation = useCreateProtocolOrder();
  const completeRevealMutation = useCompleteReveal();
  const { track } = useAnalytics();
  const showAutopilotCard = useFeatureFlagEnabled(
    FeatureFlags.ProtocolAutopilot,
  );

  const navigate = useNavigate();

  const itemsByGoal = React.useMemo(() => {
    const grouped = new Map<string, Activity[]>();

    if (!goals || !activities) return grouped;

    goals.forEach((goal) => {
      const goalActivities = activities.filter(
        (activity) =>
          ['product', 'service', 'prescription'].includes(activity.type) &&
          activity.goalIds?.includes(goal.id),
      );
      if (goalActivities.length > 0) {
        grouped.set(goal.id, goalActivities);
      }
    });

    return grouped;
  }, [goals, activities]);

  const { subtotalOriginal, subtotalDiscounted, memberDiscount } =
    React.useMemo(() => {
      let original = 0;
      let discounted = 0;

      for (const item of items) {
        // Exclude prescriptions from total calculation
        if (item.data.type === 'prescription') {
          continue;
        }

        const { originalCents, finalCents } = getActivityPricing(
          item.data,
          null,
        );
        original += originalCents;
        discounted += finalCents;
      }

      return {
        subtotalOriginal: original,
        subtotalDiscounted: discounted,
        memberDiscount: original - discounted,
      };
    }, [items]);

  const handleToggleItem = (
    activity: Activity,
    goalId: string,
    index: number,
  ) => {
    const activityId = getActivityId(activity, goalId, index);

    if (hasItem(activityId)) {
      removeItem(activityId);
    } else {
      addItem(activity, goalId, index);
    }
  };

  return (
    <ProtocolLayout className="pt-8 lg:pt-24">
      <div className="sticky top-20 hidden w-40 shrink-0 lg:block">
        <Button
          variant="ghost"
          className="group -ml-1.5 flex items-center gap-0.5 p-0"
          onClick={() => {
            previous();
          }}
        >
          <ChevronLeft className="-mt-px w-[15px] text-zinc-400 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-zinc-600" />
          <Body2 className="text-zinc-500 transition-all duration-150 group-hover:text-zinc-700">
            Back
          </Body2>
        </Button>
      </div>
      <div className="mx-auto mb-24 w-full max-w-[680px] space-y-12 px-6 lg:px-0">
        <div className="space-y-2 text-center">
          <div className="space-y-4">
            <Avatar
              className="mx-auto size-24 cursor-default bg-vermillion-700"
              size="large"
              src={
                data?.gender === 'female'
                  ? '/user/fallback-avatar-female.webp'
                  : '/user/fallback-avatar-male.webp'
              }
            />
            <div>
              {isLoading ? (
                <Skeleton className="mx-auto h-10 w-40" />
              ) : (
                <H4 className="text-center">
                  {data?.firstName} {data?.lastName}
                </H4>
              )}
              <H4 className="text-center text-secondary">Personal Protocol</H4>
            </div>
            <Body1 className="mx-auto max-w-xs text-center text-secondary">
              The following protocol is designed to address your key areas of
              health.
            </Body1>
            <SuperpowerUserSignature />
          </div>
        </div>
        {showAutopilotCard && <AutopilotCard />}
        <div className="space-y-8">
          {goals?.map((goal, goalIndex) => {
            const activities = itemsByGoal.get(goal.id) || [];

            return (
              <div key={goal.id} className="flex flex-col items-start gap-2">
                <ProtocolGoalPriority code={goal.priority} variant="badge" />
                <H4>
                  {goalIndex + 1}. {goal.introduction}
                </H4>
                <div className="w-full space-y-3">
                  {activities.length === 0 && (
                    <div className="flex w-full items-center justify-center rounded-xl bg-zinc-100 py-4">
                      <Body2 className="py-12 text-center text-secondary">
                        No activites found.
                      </Body2>
                    </div>
                  )}
                  {activities.map((activity, activityIndex) => {
                    const activityId = getActivityId(
                      activity,
                      goal.id,
                      activityIndex,
                    );
                    const isSelected = hasItem(activityId);

                    return (
                      <CheckoutItemCard
                        key={`${goal.id}-${activityIndex}`}
                        activity={activity}
                        selected={isSelected}
                        onToggle={() =>
                          handleToggleItem(activity, goal.id, activityIndex)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* TODO: Map these and update the card, just exchange to variables */}
        {/* <div className="space-y-4">
          <H4>Avoid these for now:</H4>
          <CheckoutAvoidCard />
        </div> */}
        <div
          className={cn(
            'transition-all overflow-hidden duration-300 ease-out',
            subtotalDiscounted > 0
              ? 'max-h-40'
              : 'max-h-0 opacity-0 blur-[1px]',
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Body2 className="text-secondary">Subtotal</Body2>
              <Body2>
                <NumberFlow prefix="$" value={subtotalOriginal / 100} />
              </Body2>
            </div>
            <div
              className={cn(
                'flex items-center justify-between overflow-hidden transition-all ease-out duration-200',
                memberDiscount <= 0 ? 'h-0 opacity-0 blur-[1px]' : 'h-12',
              )}
            >
              <Body2 className="text-secondary">Member discount</Body2>
              <Body2 className="text-vermillion-900">
                <NumberFlow prefix="-$" value={memberDiscount / 100} />
              </Body2>
            </div>
            <div className="flex items-center justify-between">
              <Body2 className="text-secondary">Shipping</Body2>
              <Body2>Free</Body2>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
            <Body2 className="text-secondary">Total</Body2>
            <Body2>
              <NumberFlow prefix="$" value={subtotalDiscounted / 100} />
            </Body2>
          </div>
        </div>
        <div className="flex w-full flex-col justify-between gap-4 pt-6">
          <Button
            disabled={!subtotalDiscounted || createOrderMutation.isPending}
            onClick={async () => {
              const carePlanId = revealData?.carePlanId;

              if (!carePlanId) {
                console.error('No protocol ID available');
                return;
              }

              try {
                await createOrderMutation.mutateAsync({
                  carePlanId,
                  items,
                });

                next();
              } catch (error: any) {
                console.error('Failed to create protocol order', error);

                // Handle edge case: if order already exists with completed checkouts,
                // mark reveal as completed and redirect to protocol
                // The backend should return an error indicating this state
                const errorMessage = error?.message || '';
                if (errorMessage.includes('already exists')) {
                  try {
                    await completeRevealMutation.mutateAsync(carePlanId);
                    track('protocol_reveal_quit', {
                      reason: 'order_already_exists',
                      careplanId: carePlanId,
                    });
                    navigate('/protocol');
                    return;
                  } catch (completeError) {
                    console.error('Failed to complete reveal', completeError);
                    navigate('/protocol');
                    return;
                  }
                }

                toast.error(
                  'Unable to create your protocol order. Please try again or contact support if this issue persists.',
                );
              }
            }}
          >
            {createOrderMutation.isPending ? 'Loading...' : 'Continue'}
          </Button>
          <Button
            variant="outline"
            disabled={completeRevealMutation.isPending}
            onClick={async () => {
              const carePlanId = revealData?.carePlanId;

              if (!carePlanId) {
                console.error('No protocol ID available');
                navigate('/protocol');
                return;
              }

              try {
                if (import.meta.env.DEV) {
                  console.debug(
                    '[CheckoutStep] Completing reveal without placing an order',
                    { carePlanId },
                  );
                }
                track('protocol_reveal_quit', {
                  reason: 'order_summary_step_quit',
                  careplanId: carePlanId,
                });
                await completeRevealMutation.mutateAsync(carePlanId);
                navigate('/protocol');
              } catch (error) {
                console.error('Failed to complete reveal', error);
                toast.error(
                  'Unable to complete your protocol. Please try again or contact support if this issue persists.',
                );
              }
            }}
          >
            I don&apos;t want to act on my results yet
          </Button>
        </div>
      </div>
      <div className="hidden w-40 shrink-0 lg:block" />
    </ProtocolLayout>
  );
}
