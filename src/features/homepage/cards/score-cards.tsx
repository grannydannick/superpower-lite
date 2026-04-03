import NumberFlow from '@number-flow/react';

import { QuickLinkButton } from '@/components/ui/quick-link';
import { Spinner } from '@/components/ui/spinner';
import { useLatestHealthScore } from '@/features/data/api';
import { useLatestBioAge } from '@/features/data/api/get-latest-bio-age';
import { ShareableCardsModal } from '@/features/shareables/components/shareable-cards-modal';
import { useUser } from '@/lib/auth';
import { yearsSinceDate } from '@/utils/format';

const SuperpowerScore = ({
  isLoading,
  superpowerScore,
  lastTestDate,
}: {
  isLoading: boolean;
  superpowerScore: number;
  lastTestDate?: string;
}) => {
  const lastTestLabel = lastTestDate
    ? formatTimeSince(lastTestDate)
    : undefined;

  return (
    <ShareableCardsModal disabled={isLoading} preselectedTab="score">
      <QuickLinkButton className="to-vermillion-600 flex h-full flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 p-5 text-white">
        <p className="text-sm font-medium lowercase tracking-wide opacity-90">
          superpower score
        </p>
        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            {isLoading ? (
              <p className="text-sm opacity-70">Waiting for results...</p>
            ) : (
              <>
                <span className="text-5xl font-bold leading-none">
                  <NumberFlow value={superpowerScore ?? 0} />
                </span>
                <span className="text-lg opacity-60">/ 100</span>
              </>
            )}
          </div>
          {!isLoading && lastTestLabel != null && (
            <p className="mt-2 text-xs opacity-70">
              Last test was {lastTestLabel}
            </p>
          )}
        </div>
      </QuickLinkButton>
    </ShareableCardsModal>
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
  const younger = ageDifference >= 0;

  return (
    <ShareableCardsModal disabled={isLoading} preselectedTab="age">
      <QuickLinkButton className="flex h-full flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 p-5 text-white">
        <p className="text-sm font-medium lowercase tracking-wide opacity-90">
          biological age
        </p>
        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            {isLoading ? (
              <p className="text-sm opacity-70">Waiting for results...</p>
            ) : (
              <>
                <span className="text-5xl font-bold leading-none">
                  <NumberFlow
                    value={biologicalAge ?? 0}
                    format={{
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    }}
                  />
                </span>
                <span className="text-lg opacity-60">years old</span>
              </>
            )}
          </div>
          {!isLoading && ageDifference != null && (
            <p className="mt-2 text-xs opacity-70">
              {younger ? "You're" : 'Aging'}{' '}
              {Math.abs(ageDifference).toFixed(1)} years{' '}
              {younger ? 'younger' : 'older'}
            </p>
          )}
        </div>
      </QuickLinkButton>
    </ShareableCardsModal>
  );
};

function formatTimeSince(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'today';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `over ${Math.floor(diffDays / 30)} months ago`;
  return `over ${Math.floor(diffDays / 365)} years ago`;
}

export function ScoreCards() {
  const { data: user } = useUser();
  const latestHealthScoreQuery = useLatestHealthScore();
  const latestBiologicalAgeQuery = useLatestBioAge();

  if (!user) return null;

  if (latestHealthScoreQuery.isLoading || latestBiologicalAgeQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (
    !latestHealthScoreQuery.data?.healthScore ||
    !latestBiologicalAgeQuery.data?.bioAge
  ) {
    return null;
  }

  const latestBiologicalAge =
    latestBiologicalAgeQuery.data.bioAge.quantity?.value ?? 0;

  const ageDifference =
    Math.round((yearsSinceDate(user.dateOfBirth) - latestBiologicalAge) * 10) /
    10.0;

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <SuperpowerScore
        isLoading={latestHealthScoreQuery.isLoading}
        superpowerScore={
          latestHealthScoreQuery.data.healthScore.quantity?.value ?? 0
        }
        lastTestDate={latestHealthScoreQuery.data.healthScore.timestamp}
      />
      <BiologicalAge
        isLoading={latestBiologicalAgeQuery.isLoading}
        biologicalAge={latestBiologicalAge}
        ageDifference={ageDifference}
      />
    </div>
  );
}
