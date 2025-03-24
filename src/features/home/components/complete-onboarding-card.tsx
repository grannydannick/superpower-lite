import { useMemo } from 'react';

import { Body1, Body2, H4 } from '@/components/ui/typography';
import { useTimeline } from '@/features/home/api/get-timeline';

export const CompleteOnboardingCard = () => {
  const timelineQuery = useTimeline();

  const timeline = timelineQuery.data;

  const { completed, total, progress, hasIncomplete } = useMemo(() => {
    const questionnaires =
      timeline?.filter((t) => t.type === 'ONBOARDING_TASK') ?? [];
    const totalQ = questionnaires.length;
    const completedQ = questionnaires.filter((q) => q.status === 'DONE').length;

    const rawProgress = totalQ > 0 ? (completedQ / totalQ) * 100 : 0;

    const clampedProgress = Number(
      Math.min(Math.max(rawProgress, 0), 100).toFixed(0),
    );

    const incompleteQ = questionnaires.some((q) => q.status !== 'DONE');

    return {
      completed: completedQ,
      total: totalQ,
      progress: clampedProgress,
      hasIncomplete: incompleteQ,
    };
  }, [timeline]);

  if (!hasIncomplete) {
    return null;
  }

  return (
    <div className="flex h-[188px] w-full flex-col justify-between rounded-3xl bg-primary p-5">
      <div className="space-y-1">
        <H4 className="text-white">Complete your onboarding</H4>
        <Body2 className="text-zinc-400">
          {completed} of {total} tasks completed
        </Body2>
      </div>
      <div className="flex items-end justify-between">
        <CompletedItemsProgress progress={progress} />
        <Body2 className="text-zinc-400">Incomplete</Body2>
      </div>
    </div>
  );
};

const CompletedItemsProgress = ({ progress }: { progress: number }) => {
  return (
    <>
      <div className="relative size-16">
        <svg
          className="size-full -rotate-90"
          viewBox="0 0 36 36"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-current text-zinc-700"
            strokeWidth="2"
          ></circle>
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-current text-green-500"
            strokeWidth={progress === 0 ? 0 : 2}
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            strokeLinecap="round"
          ></circle>
        </svg>

        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Body1 className="text-white">{progress}%</Body1>
        </div>
      </div>
    </>
  );
};
