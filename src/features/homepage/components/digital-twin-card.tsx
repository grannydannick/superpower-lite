import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useBiomarkers } from '@/features/data/api';
import { DigitalTwin } from '@/features/digital-twin/components/digital-twin';
import { useUser } from '@/lib/auth';

export const DigitalTwinCard = () => {
  const { data: user } = useUser();
  const { data: biomarkers, isLoading } = useBiomarkers();

  const mostRecentBiomarkerTimestamp = biomarkers?.biomarkers
    ? biomarkers.biomarkers
        .flatMap((biomarker) => biomarker.value)
        .reduce(
          (latest, result) => {
            const latestDate = new Date(latest?.timestamp ?? 0);
            const resultDate = new Date(result.timestamp);
            return resultDate > latestDate ? result : latest;
          },
          biomarkers.biomarkers.flatMap((biomarker) => biomarker.value)[0],
        )?.timestamp
    : null;

  return (
    <div className="relative top-0 hidden h-full lg:block">
      <div className="sticky top-[120px] flex max-h-[1000px] rounded-3xl bg-zinc-100 lg:items-center lg:justify-end">
        <div className="absolute left-6 top-6 z-10">
          {user ? (
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
        {!isLoading && mostRecentBiomarkerTimestamp ? (
          <div className="absolute bottom-6 left-6 z-10 text-sm text-zinc-400">
            Last updated {format(mostRecentBiomarkerTimestamp, 'MMM d, yyyy')}
          </div>
        ) : (
          isLoading && (
            <Skeleton className="absolute bottom-6 left-6 z-10 h-6 w-40" />
          )
        )}

        <DigitalTwin />
      </div>
    </div>
  );
};
