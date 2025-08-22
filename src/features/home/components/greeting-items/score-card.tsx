import { LockIcon } from '@/components/icons';
import { ArrowTopRight } from '@/components/icons/arrow-top-right-icon';
import NumberFlow from '@/components/shared/number-flow';
import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Body2 } from '@/components/ui/typography';
import { SCORE_MESSAGES } from '@/const/score-messages';
import { useBiomarkers } from '@/features/biomarkers/api';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import { ShareableCardsModal } from '@/features/shareables/components/shareable-cards-modal';

import { GreetingCard } from './greeting-card';

export const ScoreCard = () => {
  const getBiomarkersQuery = useBiomarkers();

  const latestScore = mostRecent(
    getBiomarkersQuery.data?.biomarkers.find((b) => b.name == 'Health Score')
      ?.value ?? [],
  );

  return (
    <ShareableCardsModal
      disabled={!latestScore || getBiomarkersQuery.isLoading}
      preselectedTab="score"
    >
      <GreetingCard
        className="mx-auto max-w-sm cursor-pointer"
        isLoading={getBiomarkersQuery.isLoading}
      >
        <div className="flex w-full justify-between gap-4">
          <SuperpowerScoreLogo />
          {latestScore ? (
            <ArrowTopRight className="size-6 transition-all duration-300 group-hover:-mr-1 group-hover:-mt-1" />
          ) : (
            <LockIcon fill="currentColor" className="size-6 text-white/50" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-6xl leading-none">
            {latestScore ? (
              <h2>
                <NumberFlow
                  className="-mb-4"
                  value={latestScore?.quantity.value ?? 0}
                />
                <span className="text-sm leading-none">/ 100</span>
              </h2>
            ) : (
              <h2>---</h2>
            )}
          </div>
          <Body2 className="text-white">
            {latestScore
              ? SCORE_MESSAGES.find(
                  (message) =>
                    latestScore?.quantity?.value &&
                    latestScore?.quantity?.value >= message.range[0] &&
                    latestScore?.quantity?.value <= message.range[1],
                )?.message
              : 'Awaiting lab results'}
          </Body2>
        </div>
      </GreetingCard>
    </ShareableCardsModal>
  );
};
