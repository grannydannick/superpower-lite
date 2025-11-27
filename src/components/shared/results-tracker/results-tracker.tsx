import { useMemo } from 'react';

import { QuickLink } from '@/components/ui/quick-link';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';
// eslint-disable-next-line import/no-restricted-paths
import { useDataGating } from '@/features/data/hooks/use-data-gating';
import { cn } from '@/lib/utils';

import { ResultsProgress } from './results-progress';

export const ResultsTracker = ({ className }: { className?: string }) => {
  const gating = useDataGating();

  const { title, subtitle, value } = useMemo(() => {
    // if no orders at all = users didn't even book, should book a test first
    if (gating.hasNoOrders)
      return {
        title: 'Schedule your appointment to receive your results',
        subtitle:
          'Your results and protocol will be available 7-10 days after your appointment',
        value: 0.1,
      };

    // If there is something scheduled but in the future, we return custom messaging
    if (gating.isAppointmentInFuture)
      return {
        title: 'Your appointment is scheduled',
        subtitle:
          'Your results and protocol will be available 7-10 days after your appointment',
        value: 0.25,
      };

    // If order is older than 5 days or has any biomarkers, update that all results will be there shortly
    if (gating.isTestAppointmentOlderThan5Days || gating.hasAnyBiomarkers)
      return {
        title: 'We are processing your new results',
        subtitle:
          'Your new results and health protocol will be ready in 5-7 days',
        value: 0.75,
      };

    // Default behavior, is not longer than five days and doesn't have biomarkers but appointment is in the past
    return {
      title: 'We are processing your new results',
      subtitle:
        'Your new results and health protocol will be ready in 7-10 days',
      value: 0.55,
    };
  }, [gating]);

  if (gating.isLoading) {
    return <Skeleton className="h-32 w-full rounded-2xl" />;
  }

  if (
    gating.hasCompletedPlan &&
    !gating.hasNoOrders &&
    !gating.hasUncompletedOrder
  ) {
    return null;
  }

  return (
    <QuickLink
      to="/marketplace"
      className={cn(
        'flex flex-col space-y-4 rounded-2xl border border-zinc-200 bg-white pt-0 shadow-sm',
        className,
      )}
    >
      <div className="space-y-1 pr-6">
        <Body1>{title}</Body1>
        <Body2 className="text-secondary">{subtitle}</Body2>
      </div>
      <ResultsProgress value={value} />
    </QuickLink>
  );
};
