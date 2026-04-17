import NumberFlow from '@number-flow/react';

import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Body2 } from '@/components/ui/typography';

import { ScoreArc } from './score-card-arcs';

function getLastTestedMessage(daysSince: number) {
  if (daysSince <= 0) {
    return { text: 'Tested today', color: 'bg-emerald-400' };
  }

  if (daysSince === 1) {
    return { text: 'Tested yesterday', color: 'bg-emerald-400' };
  }

  if (daysSince <= 30) {
    return {
      text: `Tested ${daysSince} days ago`,
      color: 'bg-emerald-400',
    };
  }

  const months = Math.floor(daysSince / 30);

  if (daysSince <= 90) {
    return {
      text: `Last test was ${months} ${months === 1 ? 'month' : 'months'} ago`,
      color: 'bg-yellow-400',
    };
  }

  return {
    text: `Last test was over ${months} months ago`,
    color: 'bg-red-400',
  };
}

interface SuperpowerScoreCardProps {
  superpowerScore: number;
  daysSinceLastTest: number;
  onReveal: () => void;
}

export const SuperpowerScoreCard = ({
  superpowerScore,
  daysSinceLastTest,
  onReveal,
}: SuperpowerScoreCardProps) => {
  const lastTested = getLastTestedMessage(daysSinceLastTest);

  return (
    <button
      type="button"
      onClick={onReveal}
      className="relative flex h-full min-h-[200px] flex-1 flex-col items-center overflow-hidden rounded-2xl bg-cover bg-center p-4 text-center shadow-md shadow-black/[.12]"
      style={{ backgroundImage: "url('/cards/organic-orange.webp')" }}
    >
      <img
        src="/cards/woman.webp"
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover mix-blend-soft-light"
      />
      <SuperpowerScoreLogo
        logoColor="white"
        className="relative z-10 w-11 sm:w-40"
      />

      <div className="relative z-10 flex flex-1 translate-y-3 flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <ScoreArc progress={superpowerScore / 100} />
          <div className="absolute inset-0 flex -translate-y-3 flex-col items-center justify-center">
            <span className="-mt-2 text-5xl font-medium leading-none text-white">
              <NumberFlow value={superpowerScore} />
            </span>
            <Body2 className="-mt-3 text-white/60">out of 100</Body2>
          </div>
        </div>
      </div>
      <div className="relative z-10 -mt-6 flex items-center justify-center gap-1.5">
        <span className="relative flex size-4 shrink-0 items-center justify-center rounded-full bg-white/20">
          <span className={`size-1.5 rounded-full ${lastTested.color}`} />
        </span>
        <Body2 className="text-white/70">{lastTested.text}</Body2>
      </div>
    </button>
  );
};
