import { useEffect, useState } from 'react';

import { Body1, H4 } from '@/components/ui/typography';
import { useBiologicalAge } from '@/features/data/hooks/use-biological-age';
import { VIDEOS } from '@/features/protocol/const/videos';
import { usePreloadVideo } from '@/features/protocol/hooks/use-preload-video';

import { ScoreCounter } from './score-counter';

const TITLE_DURATION_MS = 1500;
const NO_TITLE_START_MS = 350;
const NO_TITLE_END_MS = 200;

const NO_TITLE_IDXS = VIDEOS.map((v, i) => (!v.title ? i : -1)).filter(
  (i) => i >= 0,
);

const DURATIONS = (() => {
  const n = VIDEOS.length;
  const m = NO_TITLE_IDXS.length;
  const arr = Array.from({ length: n }, () => TITLE_DURATION_MS);
  if (m > 0) {
    if (m === 1) {
      arr[NO_TITLE_IDXS[0]] = NO_TITLE_END_MS;
    } else {
      const ratio = Math.pow(NO_TITLE_END_MS / NO_TITLE_START_MS, 1 / (m - 1));
      NO_TITLE_IDXS.forEach((idx, k) => {
        arr[idx] = Math.round(NO_TITLE_START_MS * Math.pow(ratio, k));
      });
    }
  }
  return arr;
})();

export const VideoSequence = ({ onComplete }: { onComplete: () => void }) => {
  const { biologicalAge } = useBiologicalAge();
  const [index, setIndex] = useState(0);

  const total = VIDEOS.length;
  const item = VIDEOS[index];
  const nextItem = index + 1 < total ? VIDEOS[index + 1] : undefined;

  usePreloadVideo(nextItem?.source);

  useEffect(() => {
    const ms = Math.max(0, DURATIONS[index] ?? TITLE_DURATION_MS);
    const id = window.setTimeout(() => {
      const next = index + 1;
      if (next >= total) {
        onComplete();
      } else {
        setIndex(next);
      }
    }, ms);
    return () => window.clearTimeout(id);
  }, [index, total, onComplete]);

  const stepsThroughIndex = NO_TITLE_IDXS.filter((i) => i <= index).length;
  const totalNoTitleSteps = NO_TITLE_IDXS.length;
  const currentStepCapped = totalNoTitleSteps
    ? Math.min(stepsThroughIndex, Math.max(0, totalNoTitleSteps - 1))
    : 0;
  const remainingDuration = DURATIONS.slice(index + 1).reduce(
    (sum, d) => sum + d,
    0,
  );

  return (
    <div className="relative h-screen w-full bg-black">
      <video
        className="absolute inset-0 size-full object-cover"
        src={item.source}
        autoPlay
        muted
        playsInline
        preload="metadata"
      />
      {!item.title && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <ScoreCounter
            value={biologicalAge ?? 0}
            currentStep={currentStepCapped}
            totalSteps={totalNoTitleSteps}
            reserve={1}
            animationDuration={remainingDuration}
          >
            <div className="pointer-events-none opacity-0">
              <H4 className="text-center font-bold text-white">
                biological age
              </H4>
              <Body1 className="text-center text-white/80">Loading...</Body1>
            </div>
          </ScoreCounter>
        </div>
      )}
      {item.title && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
          <div
            key={index}
            className="mask-reveal-left max-w-3xl text-center text-white/95"
          >
            <p className="text-2xl font-semibold duration-500 animate-in fade-in md:text-3xl">
              {item.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
