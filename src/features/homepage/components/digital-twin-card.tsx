import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { DigitalTwin } from '@/features/digital-twin/components/digital-twin';
import { useLatestCompletedPlan } from '@/features/plans/hooks/use-latest-completed-plan';
import { useUser } from '@/lib/auth';

export const DigitalTwinCard = () => {
  const { data: user } = useUser();
  const { data: latestPlan, latestCompletedPlanDate } =
    useLatestCompletedPlan();

  return (
    <div className="relative hidden max-h-[1000px] rounded-3xl bg-zinc-100 lg:flex lg:items-center lg:justify-end">
      <div className="absolute left-6 top-6 z-10">
        {latestPlan ? (
          <h2 className="text-3xl font-medium text-zinc-400">
            {user?.firstName}&apos;s
            <br />
            Digital Twin
          </h2>
        ) : (
          <h2 className="text-3xl font-medium text-zinc-400">
            Unlock after
            <br />
            your first baseline test
          </h2>
        )}
      </div>

      {/* Top right overlay: Expand icon */}
      <Link
        to="/data"
        className="absolute right-6 top-6 z-10 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-200"
        aria-label="Expand digital twin"
      >
        <ArrowUpRight className="size-6" strokeWidth={1.5} />
      </Link>

      {/* Bottom left overlay: Last tested date */}
      {latestCompletedPlanDate && (
        <div className="absolute bottom-6 left-6 z-10 text-sm text-zinc-400">
          Last tested: {latestCompletedPlanDate}
        </div>
      )}

      <DigitalTwin />
    </div>
  );
};
