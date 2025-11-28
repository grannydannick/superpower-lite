import { ChevronLeft } from '@/components/icons/chevron-left-icon';
import { Link } from '@/components/ui/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';

import { useProtocol } from '../../api';
import { ProtocolLayout } from '../layouts/protocol-layout';

import { ProtocolGoal } from './protocol-goal';

type ProtocolGoalViewProps = {
  protocolId: string;
  goalId: string;
};

/**
 * View for a specific goal and its activities
 * Path: /protocol/plans/:planId/goals/:goalId
 */
export function ProtocolGoalView({
  protocolId,
  goalId,
}: ProtocolGoalViewProps) {
  const { data: protocol, isLoading, error } = useProtocol(protocolId);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 p-6 lg:px-0">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-12 w-2/3 rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Body1 className="text-red-600">
          Failed to load goal. Please try again later.
        </Body1>
      </div>
    );
  }

  const goal = protocol.goals.find((g) => g.id === goalId);

  if (!goal) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Body1 className="text-red-600">Goal not found.</Body1>
      </div>
    );
  }

  // Filter activities that are linked to this goal
  const goalActivities = protocol.activities.filter(
    (activity) =>
      ['product', 'service', 'prescription'].includes(activity.type) &&
      activity.goalIds.includes(goalId),
  );

  return (
    <ProtocolLayout className="lg:pt-7">
      <div className="sticky top-20 hidden w-40 shrink-0 lg:block">
        <Link
          to="/protocol"
          className="group -ml-1.5 flex items-center gap-0.5 p-0"
        >
          <ChevronLeft className="-mt-px w-[15px] text-zinc-400 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-zinc-600" />
          <Body2 className="text-zinc-500 transition-all duration-150 group-hover:text-zinc-700">
            Back
          </Body2>
        </Link>
      </div>
      <div className="mx-auto w-full max-w-[680px] space-y-12 pb-24">
        <ProtocolGoal
          goal={goal}
          activities={goalActivities}
          allGoals={protocol.goals}
        />
      </div>
      <div className="hidden w-40 shrink-0 lg:block" />
    </ProtocolLayout>
  );
}
