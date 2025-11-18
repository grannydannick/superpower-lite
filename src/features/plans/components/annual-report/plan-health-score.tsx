import NumberFlow from '@number-flow/react';

import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { QuickLink } from '@/components/ui/quick-link';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H2 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/data/api';
import { mostRecent } from '@/features/data/utils/most-recent-biomarker';
import { ShareableCardsModal } from '@/features/shareables/components/shareable-cards-modal';
import { useUser } from '@/lib/auth';
import { yearsSinceDate } from '@/utils/format';

import { BiomarkerDistributionBar } from './biomarker-distribution-bar';
import { PhilosophyBlocks } from './philosophy-blocks';

const MESSAGES = [
  {
    scoreRange: [0, 49],
    message:
      "your health metrics suggest there's significant room for improvement. Your personalized plan will help you take the first steps toward better health.",
    shortMessage: 'Significant room for improvement',
  },
  {
    scoreRange: [50, 69],
    message:
      "you're on the right track, but there are still areas where you can make meaningful improvements to boost your overall health.",
    shortMessage: 'Good foundation, room to grow',
  },
  {
    scoreRange: [70, 89],
    message:
      "you're doing well! Your health metrics show you're making good choices. Let's fine-tune a few areas to get you to optimal.",
    shortMessage: "You're doing well",
  },
  {
    scoreRange: [90, 100],
    message:
      'congratulations! Your health metrics are in excellent shape. Keep up the great work and maintain these healthy habits.',
    shortMessage: 'Excellent health metrics',
  },
];

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
    <ShareableCardsModal disabled={isLoading} preselectedTab="score">
      <QuickLink className="flex-1 overflow-hidden bg-white">
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
  return (
    <ShareableCardsModal disabled={isLoading} preselectedTab="age">
      <QuickLink className="h-full flex-1 overflow-hidden bg-white">
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
                years
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
    </ShareableCardsModal>
  );
};

export function PlanHealthScore({
  showOverview = true,
}: {
  showOverview?: boolean;
}) {
  const { data: user } = useUser();
  const { data: biomarkersData, isLoading: biomarkersLoading } =
    useBiomarkers();

  if (!user) return null;

  if (biomarkersLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!biomarkersData) {
    return null;
  }

  const healthScore = biomarkersData.biomarkers.find(
    (b) => b.name == 'Health Score',
  );

  if (!healthScore) {
    console.warn('Health score not found.');
    return null;
  }

  const latestScore = mostRecent(healthScore.value);

  if (!latestScore) {
    console.warn('Latest health score not found.');
    return null;
  }

  const biologicalAge = biomarkersData.biomarkers.find(
    (b) => b.name == 'Biological Age',
  );

  if (!biologicalAge) {
    console.warn('Biological age not found.');
    return null;
  }

  const latestBiologicalAge = mostRecent(biologicalAge.value)?.quantity.value;

  if (!latestBiologicalAge) {
    console.warn('Latest biological age not found.');
    return null;
  }

  const ageDifference = latestBiologicalAge
    ? Math.round(
        (yearsSinceDate(user.dateOfBirth) - latestBiologicalAge) * 10,
      ) / 10.0
    : 0;

  return (
    <div>
      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-col gap-2 md:flex-row">
            <SuperpowerScore
              isLoading={biomarkersLoading}
              superpowerScore={latestScore.quantity.value ?? 0}
            />
            <BiologicalAge
              isLoading={biomarkersLoading}
              biologicalAge={latestBiologicalAge ?? 0}
              ageDifference={ageDifference ?? 0}
            />
          </div>
        </div>
      </div>
      {showOverview && (
        <>
          <div className="mx-auto mt-3 w-full max-w-3xl flex-1 overflow-y-auto rounded-xl border border-zinc-200 bg-white px-4 pt-4 shadow-md shadow-black/[.02] scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300">
            <div className="flex flex-col gap-4">
              <Body2 className="font-semibold">Overview</Body2>
              <BiomarkerDistributionBar />
            </div>
          </div>
          <PhilosophyBlocks />
        </>
      )}
    </div>
  );
}
