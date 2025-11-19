import NumberFlow from '@number-flow/react';
import { format } from 'date-fns';
import { useEffect } from 'react';

import QuickLink from '@/components/shared/quicklink';
import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Body2, H2, H4 } from '@/components/ui/typography';
import { PhlebotomyProgress } from '@/features/homepage/cards/phlebotomy-appointment/phlebotomy-progress';
import { useOrders } from '@/features/orders/api';
import { useUser } from '@/lib/auth';
import { yearsSinceDate } from '@/utils/format';

import { useBiomarkers } from '../api';
import { MESSAGES } from '../const/messages';
import { useDataGating } from '../hooks/use-data-gating';
import { useFilteredBiomarkers } from '../hooks/use-filtered-biomarkers';
import { useDataFilterStore } from '../stores/data-filter-store';
import { mostRecent } from '../utils/most-recent-biomarker';

import { BiologicalAgeDialog } from './dialogs/biological-age-dialog';
import { SuperpowerScoreDialog } from './dialogs/superpower-score-dialog';
import { DataFilter } from './filter/data-filter';
import { BiomarkerSkeletonRow } from './table/biomarker-skeleton-row';
import { BiomarkersDataTable } from './table/biomarkers-data-table';
import { WaitingScreen } from './waiting-screen';

const SuperpowerScore = ({
  isLoading,
  superpowerScore,
}: {
  isLoading: boolean;
  superpowerScore: number;
}) => {
  const overviewCopy = MESSAGES.find(
    (m) =>
      m.scoreRange[0] <= superpowerScore! &&
      m.scoreRange[1] >= superpowerScore!,
  );

  return (
    <SuperpowerScoreDialog disabled={isLoading}>
      <QuickLink className="flex-1 overflow-hidden">
        <SuperpowerScoreLogo logoColor="currentColor" className="mb-2 w-40" />
        <div className="mb-1 flex items-end justify-start gap-1">
          {isLoading ? (
            <Body2 className="m-0 mt-[54px] leading-none text-zinc-400">
              Waiting for results...
            </Body2>
          ) : (
            <>
              <H2 className="m-0 leading-none">
                <NumberFlow value={superpowerScore ?? 0} />
              </H2>
              <Body2 className="m-0 mb-2 leading-none text-zinc-400 md:mb-3">
                / 100
              </Body2>
            </>
          )}
        </div>
        {!isLoading && (
          <Body2 className="text-zinc-400">{overviewCopy?.shortMessage}</Body2>
        )}
      </QuickLink>
    </SuperpowerScoreDialog>
  );
};

const BiologicalAge = ({
  isLoading,
  biologicalAge,
  ageDifference,
}: {
  isLoading: boolean;
  biologicalAge: number;
  ageDifference: number;
}) => {
  const { data } = useUser();

  return (
    <BiologicalAgeDialog disabled={isLoading || !biologicalAge}>
      <QuickLink className="h-full flex-1 overflow-hidden">
        <Body2 className="mb-5 font-semibold">Biological Age</Body2>
        <div className="mb-1 flex items-end justify-start gap-1">
          {isLoading ? (
            <Body2 className="m-0 mt-[54px] leading-none text-zinc-400">
              Waiting for results...
            </Body2>
          ) : (
            <>
              <H2 className="m-0 leading-none">
                <NumberFlow value={biologicalAge ?? 0} />
              </H2>
              <Body2 className="m-0 mb-2 leading-none text-zinc-400 md:mb-3">
                / {Math.round(yearsSinceDate(data?.dateOfBirth ?? ''))}
              </Body2>
            </>
          )}
        </div>
        {!isLoading && (
          <Body2 className="text-zinc-400">
            {ageDifference &&
              Math.abs(ageDifference) +
                ' years ' +
                (ageDifference >= 0 ? 'younger' : 'older') +
                ' than your actual age'}
          </Body2>
        )}
      </QuickLink>
    </BiologicalAgeDialog>
  );
};

export const Overview = () => {
  const { clearRange, clearCategories, clearOrderId, clearSearchQuery } =
    useDataFilterStore();
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: biomarkers } = useBiomarkers();
  const { data: orders } = useOrders();
  const gating = useDataGating();
  const filteredBiomarkers = useFilteredBiomarkers({
    biomarkers: biomarkers?.biomarkers,
    orders: orders?.orders ?? [],
  });

  // we want to remove all filters initially
  useEffect(() => {
    clearRange();
    clearCategories();
    clearOrderId();
    clearSearchQuery();
  }, [clearRange, clearCategories, clearOrderId, clearSearchQuery]);

  const isLoading = isUserLoading || gating.isLoading;

  const latestScoreMarker = mostRecent(
    biomarkers?.biomarkers.find((b) => b.name == 'Health Score')?.value ?? [],
  );
  const superpowerScore = latestScoreMarker?.quantity?.value;

  const biologicalAgeMarker = biomarkers?.biomarkers.find(
    (b) => b.name == 'Biological Age',
  );
  const biologicalAge = biologicalAgeMarker?.value[0]?.quantity?.value;
  const ageDifference = biologicalAge
    ? Math.round(
        (yearsSinceDate(user?.dateOfBirth ?? '') - biologicalAge) * 10,
      ) / 10.0
    : null;

  const overviewCopy = MESSAGES.find(
    (m) =>
      m.scoreRange[0] <= superpowerScore! &&
      m.scoreRange[1] >= superpowerScore!,
  );

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

  if (
    !isUserLoading &&
    gating.shouldShowWaiting &&
    !gating.isTestAppointmentOlderThan5Days
  ) {
    return <WaitingScreen />;
  }

  // Hide SP score & BioAge until AIAP is complete even if partial markers exist
  const markersAvailable =
    gating.hasCompletedPlan && !!superpowerScore && !!biologicalAge;

  return (
    <div className="w-full space-y-4">
      <div className="mx-auto w-full flex-1 overflow-y-auto rounded-[24px] bg-white p-4 shadow-md shadow-black/[.02] scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex w-full items-center justify-between gap-4">
              <H4>
                {user?.firstName} {user?.lastName}
              </H4>
              {mostRecentBiomarkerTimestamp && (
                <Body2 className="text-balance text-right text-zinc-400">
                  Last updated{' '}
                  {format(mostRecentBiomarkerTimestamp, 'MMM d, yyyy')}
                </Body2>
              )}
            </div>
            {!isLoading &&
              (markersAvailable ? (
                <Body2 className="text-zinc-400">
                  {user?.firstName}, {overviewCopy?.message}
                </Body2>
              ) : (
                <Body2 className="text-zinc-400">
                  {user?.firstName}, we&apos;re still processing your data, but
                  you can already take a look into your first results.
                </Body2>
              ))}
          </div>
          {markersAvailable || isLoading ? (
            <div className="flex w-full flex-col gap-4 lg:flex-row">
              <SuperpowerScore
                isLoading={isLoading}
                superpowerScore={superpowerScore ?? 0}
              />
              <BiologicalAge
                isLoading={isLoading}
                biologicalAge={biologicalAge ?? 0}
                ageDifference={ageDifference ?? 0}
              />
            </div>
          ) : (
            <div className="pt-6">
              <PhlebotomyProgress status="processing" />
            </div>
          )}
        </div>
      </div>
      <DataFilter isLoading={isLoading} />
      <div>
        {isLoading ? (
          <div className="mx-auto mt-8 space-y-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <BiomarkerSkeletonRow key={index} />
            ))}
          </div>
        ) : (
          <div className="mx-auto min-h-screen">
            <BiomarkersDataTable biomarkers={filteredBiomarkers} />
          </div>
        )}
      </div>
    </div>
  );
};
