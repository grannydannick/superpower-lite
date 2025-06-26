import { LockIcon } from '@/components/icons';
import { ArrowTopRight } from '@/components/icons/arrow-top-right-icon';
import NumberFlow from '@/components/shared/number-flow';
import { Body3, H4 } from '@/components/ui/typography';
import { useBiologicalAge } from '@/features/biomarkers/hooks/use-biological-age';
import { ShareableCardsModal } from '@/features/shareables/components/shareable-cards-modal';

import { GreetingCard } from './greeting-card';

export const AgeCard = () => {
  const { biologicalAge, ageDifference, isYounger, isLoading } =
    useBiologicalAge();

  const isEmpty = !biologicalAge;

  return (
    <ShareableCardsModal
      disabled={isEmpty || !biologicalAge || isLoading}
      preselectedTab="age"
    >
      <GreetingCard
        className="mx-auto max-w-sm cursor-pointer"
        isLoading={isLoading}
      >
        <div className="flex w-full justify-between gap-4">
          <H4 className="text-white">Biological Age</H4>
          {!isEmpty ? (
            <ArrowTopRight className="size-6 transition-all duration-300 group-hover:-mr-1 group-hover:-mt-1" />
          ) : (
            <LockIcon fill="currentColor" className="size-6 text-white/50" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-6xl leading-none">
            {!isEmpty ? (
              <h2>
                <NumberFlow className="-mb-4" value={biologicalAge ?? 0} />
              </h2>
            ) : (
              <h2>---</h2>
            )}
          </div>
          <Body3 className="text-white">
            {!isEmpty
              ? `${Math.abs(ageDifference ?? 0)} ${isYounger ? 'younger' : 'older'} than your chronological age`
              : 'Awaiting lab results'}
          </Body3>
        </div>
      </GreetingCard>
    </ShareableCardsModal>
  );
};
