import { LockKeyholeIcon } from 'lucide-react';

import { DigitalTwin } from '@/features/digital-twin/components/digital-twin';
import { useLatestCompletedPlan } from '@/features/plans/hooks/use-latest-completed-plan';

export const DigitalTwinPreviewMobile = () => {
  const { hasCompletedPlan } = useLatestCompletedPlan();

  return (
    <div className="relative h-56 w-full overflow-hidden lg:hidden">
      <div className="pointer-events-none">
        <DigitalTwin />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-zinc-50" />
      {!hasCompletedPlan && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center">
          <div
            className="pointer-events-auto flex flex-row items-center gap-3 rounded-[8px] bg-white/10 px-6 py-4"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <LockKeyholeIcon
              className="size-6 shrink-0 text-zinc-500"
              strokeWidth={1.5}
            />
            <h3 className="text-lg font-medium leading-6 text-zinc-500">
              Unlock after your baseline test
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};
