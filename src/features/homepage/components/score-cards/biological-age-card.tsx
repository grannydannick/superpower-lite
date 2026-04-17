import NumberFlow from '@number-flow/react';

import { BiologicalAgeLogo } from '@/components/shared/biological-age-logo';
import { Body2 } from '@/components/ui/typography';

import { BioAgeArc } from './score-card-arcs';

interface BiologicalAgeCardProps {
  biologicalAge: number;
  ageDifference: number;
  onReveal: () => void;
}

export const BiologicalAgeCard = ({
  biologicalAge,
  ageDifference,
  onReveal,
}: BiologicalAgeCardProps) => {
  return (
    <button
      type="button"
      onClick={onReveal}
      className="relative flex h-full min-h-[200px] flex-1 flex-col items-center overflow-hidden rounded-2xl bg-cover bg-center p-4 text-center shadow-md shadow-black/[.12]"
      style={{ backgroundImage: "url('/cards/age-card.webp')" }}
    >
      <BiologicalAgeLogo fillColor="white" className="relative z-10 mt-1" />

      <div className="relative z-10 flex flex-1 translate-y-3 flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <BioAgeArc
            bioAge={biologicalAge}
            realAge={biologicalAge + ageDifference}
          />
          <div className="absolute inset-0 flex -translate-y-1 flex-col items-center justify-center">
            <span className="-mt-2 text-5xl font-medium leading-none text-white">
              <NumberFlow
                value={biologicalAge}
                format={{
                  maximumFractionDigits: 1,
                  minimumFractionDigits: 1,
                }}
              />
            </span>
            <Body2 className="-mt-3 text-white/60">years old</Body2>
          </div>
        </div>
      </div>
      {ageDifference > 0 ? (
        <Body2 className="relative z-10 -mt-4 text-emerald-300">
          You&apos;re {ageDifference.toFixed(1)} years younger
        </Body2>
      ) : null}
    </button>
  );
};
