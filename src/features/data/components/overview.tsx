import NumberFlow from '@number-flow/react';
import { format } from 'date-fns';
import { useEffect } from 'react';

import { BiologicalAgeLogo } from '@/components/shared/biological-age-logo';
import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { QuickLinkButton } from '@/components/ui/quick-link';
import { Body2, H2, H4 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';
import { yearsSinceDate } from '@/utils/format';

import { useDataBiomarkers } from '../api/get-data-biomarkers';
import { MESSAGES } from '../const/messages';
import { useFilteredBiomarkers } from '../hooks/use-filtered-biomarkers';
import { useDataFilterStore } from '../stores/data-filter-store';
import { mostRecent } from '../utils/most-recent-biomarker';

import { BiologicalAgeDialog } from './dialogs/biological-age-dialog';
import { SuperpowerScoreDialog } from './dialogs/superpower-score-dialog';
import { DataFilter } from './filter/data-filter';
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
      <QuickLinkButton className="flex h-full flex-1 flex-col justify-between overflow-hidden bg-white lg:gap-2">
        <SuperpowerScoreLogo logoColor="currentColor" className="mb-2 w-40" />
        <div>
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
            <Body2 className="text-left text-zinc-400">
              {overviewCopy?.shortMessage}
            </Body2>
          )}
        </div>
      </QuickLinkButton>
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
      <QuickLinkButton className="flex h-full flex-1 flex-col justify-between gap-2 overflow-hidden bg-white">
        <BiologicalAgeLogo className="mt-1" />
        <div>
          <div className="mb-1 flex items-end justify-start gap-1">
            {isLoading ? (
              <Body2 className="m-0 mt-[54px] leading-none text-zinc-400">
                Waiting for results...
              </Body2>
            ) : (
              <>
                <H2 className="m-0 leading-none">
                  <NumberFlow
                    value={biologicalAge ?? 0}
                    format={{
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    }}
                  />
                </H2>
                <Body2 className="m-0 mb-2 leading-none text-zinc-400 md:mb-3">
                  / {Math.round(yearsSinceDate(data?.dateOfBirth ?? ''))}
                </Body2>
              </>
            )}
          </div>
          {!isLoading && (
            <Body2 className="text-left text-zinc-400">
              {ageDifference &&
                `${Math.abs(ageDifference).toFixed(1)} years ${
                  ageDifference >= 0 ? 'younger' : 'older'
                } than your actual age`}
            </Body2>
          )}
        </div>
      </QuickLinkButton>
    </BiologicalAgeDialog>
  );
};

export function Overview() {
  const { clearRange, clearCategories, clearSelectedOrder, clearSearchQuery } =
    useDataFilterStore();
  const { data: user, isLoading: isUserLoading } = useUser();
  const biomarkersQuery = useDataBiomarkers();

  const biomarkers = biomarkersQuery.data?.biomarkers ?? [];

  const filteredBiomarkers = useFilteredBiomarkers({
    biomarkers,
  });

  useEffect(() => {
    clearRange();
    clearCategories();
    clearSelectedOrder();
    clearSearchQuery();
  }, [clearRange, clearCategories, clearSelectedOrder, clearSearchQuery]);

  const isLoading = isUserLoading || biomarkersQuery.isLoading;

  const gating = user?.resultsGate;

  // Health Score and Biological Age are CMS biomarkers with well-known slugs.
  // TODO: confirm exact CMS slugs with backend if these don't resolve.
  const healthScoreObs = biomarkers.find(
    (b) => b.slug === 'health-score',
  )?.observation;
  const latestScoreMarker = mostRecent(healthScoreObs?.value ?? []);
  const superpowerScore = latestScoreMarker?.quantity?.value;

  const biologicalAgeObs = biomarkers.find(
    (b) => b.slug === 'biological-age',
  )?.observation;
  const biologicalAge = biologicalAgeObs?.value[0]?.quantity?.value;
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

  const mostRecentBiomarkerTimestamp = biomarkers
    .flatMap((b) => b.observation?.value ?? [])
    .reduce(
      (latest, result) => {
        const latestDate = new Date(latest?.timestamp ?? 0);
        const resultDate = new Date(result.timestamp);
        return resultDate > latestDate ? result : latest;
      },
      biomarkers.flatMap((b) => b.observation?.value ?? [])[0],
    )?.timestamp;

  const isResultsLocked =
    !isUserLoading &&
    !!gating &&
    !gating.hasFinalDiagnosticReport &&
    !gating.hasUserUploadedResults;

  if (isResultsLocked) {
    return <WaitingScreen />;
  }

  // SP Score & BioAge require a Vital-sourced final DR with enough biomarkers
  const markersAvailable =
    gating?.hasFinalDiagnosticReport && !!superpowerScore && !!biologicalAge;

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

          {markersAvailable && (
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
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
          )}
        </div>
      </div>
      <DataFilter isLoading={isLoading} />
      <div className="mx-auto min-h-screen">
        <BiomarkersDataTable
          biomarkers={filteredBiomarkers}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
