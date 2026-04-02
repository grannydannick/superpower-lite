import { useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { AnimatedCheckbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H4, H2 } from '@/components/ui/typography';
import type { ProtocolAction } from '@/features/protocol/api/protocol';
import { ProtocolBook } from '@/features/protocol/components/protocol-book';
import { ProtocolIndexNumber } from '@/features/protocol/components/protocol-index-number';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';
import { getActionTypeImage } from '@/features/protocol/const/protocol-constants';
import {
  useRevealBuilderStore,
  type CommittedAction,
} from '@/features/protocol/stores/reveal-builder-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

import { ProtocolStepLayout } from '../../../layouts/protocol-step-layout';

const MIN_COMMITTED_ACTIONS = 1;

const ProtocolReviewSkeleton = () => {
  return (
    <ProtocolStepLayout className="gap-6">
      {/* Protocol book skeleton */}
      <div className="mb-4 flex items-center justify-center">
        <Skeleton className="h-28 w-20 rounded-lg" />
      </div>

      {/* Title skeleton */}
      <div className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Goal groups skeleton */}
      <div className="space-y-8">
        {[0, 1, 2].map((groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            {/* Goal header skeleton */}
            <div className="flex items-center gap-6">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>

            {/* Action items skeleton */}
            <div>
              {[0, 1].map((actionIndex) => {
                const isFirstItem = actionIndex === 0;
                const isLastItem = actionIndex === 1;

                return (
                  <div
                    key={actionIndex}
                    className="mt-[-3px] flex w-full items-stretch gap-4"
                  >
                    <div className="flex-1 py-2">
                      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow shadow-black/[.03]">
                        <Skeleton className="size-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-center justify-center gap-2">
                      <div
                        className={cn(
                          'flex-1 border-r border-dashed',
                          isFirstItem
                            ? 'border-transparent'
                            : 'border-zinc-200',
                        )}
                      />
                      <Skeleton className="size-6 rounded-[6px]" />
                      <div
                        className={cn(
                          'flex-1 border-r border-dashed',
                          isLastItem ? 'border-transparent' : 'border-zinc-200',
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </ProtocolStepLayout>
  );
};

export const ProtocolReviewStep = () => {
  const { next, goals, isLoading } = useProtocolStepperContext();
  const {
    committedActions: committedActionsMap,
    commitAction,
    uncommitAction,
  } = useRevealBuilderStore();
  const { track } = useAnalytics();

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  const committedActions = Object.values(committedActionsMap);

  // Group actions by goal, flattening primaryAction + additionalActions
  const groupedByGoal = useMemo(() => {
    return goals
      .map((goal) => {
        const allActions: ProtocolAction[] = [
          goal.primaryAction,
          ...(goal.additionalActions ?? []),
        ];
        const goalCommittedActions = committedActions.filter(
          (action) => action.goalId === goal.id,
        );
        return {
          goal,
          selectedActions: goalCommittedActions,
          allActions,
        };
      })
      .filter((group) => group.allActions.length > 0);
  }, [goals, committedActions]);

  if (isLoading) {
    return <ProtocolReviewSkeleton />;
  }

  return (
    <ProtocolStepLayout className="gap-6">
      <div className="mb-4 flex items-center justify-center">
        <ProtocolBook
          title="Protocol"
          coverImage="/protocol/protocol-book-cover.webp"
          className="pointer-events-none w-20 [&_p]:text-[10px]"
        />
      </div>

      <div className="text-center">
        <H2 className="text-2xl">Review Your Protocol</H2>
        <Body1 className="text-secondary">
          Take a moment to step back and review your selection. Make sure it
          aligns with your health goals and feels right for you.
        </Body1>
      </div>

      <div className="space-y-8">
        {groupedByGoal.map((group, groupIndex) => (
          <div key={group.goal.id} className="space-y-4">
            <div className="flex items-center gap-6">
              <ProtocolIndexNumber
                index={groupIndex}
                className="text-2xl md:text-4xl"
              />
              <H4>{group.goal.title}</H4>
            </div>

            <div>
              {group.allActions.map((action, index) => {
                const isChecked = action.id in committedActionsMap;
                const isFirstItem = index === 0;
                const isLastItem = index === group.allActions.length - 1;
                const actionImage = getActionTypeImage(action.content);

                const handleCheckboxChange = () => {
                  const meta = {
                    action_id: action.id,
                    action_type: action.content.type,
                    action_title: action.title,
                    goal_id: group.goal.id,
                  };
                  if (isChecked) {
                    uncommitAction(action.id);
                    track('protocol_reveal_action_uncommitted', meta);
                  } else {
                    const committedAction: CommittedAction = {
                      id: action.id,
                      type: action.content.type,
                      data: action,
                      goalId: group.goal.id,
                    };
                    commitAction(committedAction);
                    track('protocol_reveal_action_committed', meta);
                  }
                };

                return (
                  <div
                    key={action.id}
                    className="mt-[-3px] flex w-full items-stretch gap-4"
                  >
                    <div className="flex-1 py-2">
                      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow shadow-black/[.03]">
                        <img
                          src={actionImage}
                          alt={action.title}
                          className="size-12 rounded-lg object-cover rounded-mask"
                        />

                        <div className="flex-1">
                          <Body1 className="text-base font-medium">
                            {action.title}
                          </Body1>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-center justify-center gap-2">
                      <div
                        className={cn(
                          'flex-1 border-r border-dashed',
                          isFirstItem
                            ? 'border-transparent'
                            : 'border-zinc-200',
                        )}
                      />

                      <AnimatedCheckbox
                        checked={isChecked}
                        onCheckedChange={handleCheckboxChange}
                        className="size-6 rounded-[6px] border border-black/10 transition-all duration-150 ease-out data-[state=checked]:bg-vermillion-900 data-[state=unchecked]:bg-white data-[state=unchecked]:hover:bg-zinc-100"
                      />
                      <div
                        className={cn(
                          'flex-1 border-r border-dashed',
                          isLastItem ? 'border-transparent' : 'border-zinc-200',
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {committedActions.length < MIN_COMMITTED_ACTIONS && (
        <Body1 className="text-center text-sm text-secondary">
          Select at least {MIN_COMMITTED_ACTIONS} action to continue (
          {committedActions.length}/{MIN_COMMITTED_ACTIONS})
        </Body1>
      )}

      <Button
        className="w-full"
        onClick={handleNext}
        disabled={committedActions.length < MIN_COMMITTED_ACTIONS}
      >
        Set up my protocol
      </Button>
    </ProtocolStepLayout>
  );
};
