import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { ProgressCircle } from '@/components/shared/progress-circle';
import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H2, H4 } from '@/components/ui/typography';
import { MESSAGES } from '@/features/data/const/messages';
import { type ScoreRevealMetrics } from '@/features/homepage/types/score-reveal-metrics';

const BLACKOUT_DURATION = 800;
const CONTENT_DELAY = 1200;
const REVEAL_DURATION = 3000;
const REVEAL_EASING = 'cubic-bezier(0.05, 0.7, 0.1, 1)';

interface ScoreRevealOverlayProps {
  type: 'score' | 'age';
  onClose: () => void;
  firstName?: string;
  metrics: ScoreRevealMetrics;
}

export const ScoreRevealOverlay = ({
  type,
  onClose,
  firstName,
  metrics,
}: ScoreRevealOverlayProps) => {
  const [blackedOut, setBlackedOut] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setBlackedOut(true));
  }, []);

  useEffect(() => {
    if (!blackedOut) return;

    const timeoutId = setTimeout(() => setShowContent(true), CONTENT_DELAY);

    return () => clearTimeout(timeoutId);
  }, [blackedOut]);

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-zinc-950 transition-opacity ease-out"
        style={{
          opacity: blackedOut ? 1 : 0,
          transitionDuration: `${BLACKOUT_DURATION}ms`,
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        {type === 'score' ? (
          <SuperpowerScoreReveal
            onClose={onClose}
            animate={showContent}
            firstName={firstName}
            metrics={metrics}
          />
        ) : (
          <BiologicalAgeReveal
            onClose={onClose}
            animate={showContent}
            metrics={metrics}
          />
        )}
      </div>
    </div>,
    document.body,
  );
};

interface RevealProps {
  onClose: () => void;
  animate: boolean;
  metrics: ScoreRevealMetrics;
}

interface SuperpowerScoreRevealProps extends RevealProps {
  firstName?: string;
}

const SuperpowerScoreReveal = ({
  onClose,
  animate,
  firstName,
  metrics,
}: SuperpowerScoreRevealProps) => {
  const overviewCopy = MESSAGES.find(
    (message) =>
      message.scoreRange[0] <= metrics.superpowerScore &&
      message.scoreRange[1] >= metrics.superpowerScore,
  );
  const description =
    firstName != null && firstName.length > 0
      ? `${firstName}, ${overviewCopy?.message ?? ''}`
      : (overviewCopy?.message ?? '');

  return (
    <div className="h-screen w-full">
      <div className="relative size-full bg-gradient-to-t from-[#4D201B] via-[#93410B] to-[#4D201B]">
        <div className="pointer-events-auto absolute left-1/2 top-8 z-20 flex -translate-x-1/2 items-center gap-3">
          <SuperpowerLogo fill="white" className="mt-1" />
        </div>
        <div className="absolute inset-0 z-10 overflow-visible p-6 text-white">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
            {animate ? (
              <ProgressCircle
                value={metrics.superpowerScore}
                animate
                progressMax={100}
                animationDuration={REVEAL_DURATION}
                easing={REVEAL_EASING}
                className="size-64 text-white lg:size-[320px]"
                borderCircles={[
                  {
                    strokeWidth: 6,
                    lgStrokeWidth: 4,
                    color: 'white',
                    blur: 'blur-[2px] lg:blur-sm',
                  },
                  {
                    strokeWidth: 28,
                    lgStrokeWidth: 64,
                    color: '#facc15',
                    blur: 'blur-2xl',
                  },
                ]}
              >
                <div className="flex flex-col items-center">
                  <SuperpowerScoreLogo />
                  <Body1 className="text-center text-white/80">
                    out of 100
                  </Body1>
                </div>
              </ProgressCircle>
            ) : (
              <Skeleton className="mx-auto size-64 rounded-full bg-white/10 lg:size-[320px]" />
            )}
          </div>
          <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex w-full flex-col items-center bg-gradient-to-b from-transparent via-black/40 to-black/60 px-6 py-24 lg:pb-[5vw] lg:pt-[10vw]">
            {animate ? (
              <>
                <H2 className="mb-2 text-center text-white animate-in fade-in">
                  Your Superpower Score is {metrics.superpowerScore}
                </H2>
                <Body1 className="mb-8 max-w-lg text-center text-white/80 delay-100 animate-in fade-in">
                  {description}
                </Body1>
                <div className="flex w-full max-w-sm flex-col gap-3">
                  <Button
                    variant="ghost"
                    className="w-full rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={onClose}
                  >
                    Dismiss
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Skeleton className="mx-auto h-12 w-64 rounded-xl bg-white/10" />
                <Skeleton className="mx-auto h-12 w-40 rounded-xl bg-white/10" />
                <Skeleton className="mx-auto h-16 w-72 rounded-full bg-white/10" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BiologicalAgeReveal = ({ onClose, animate, metrics }: RevealProps) => {
  return (
    <div className="h-screen w-full">
      <div className="relative size-full bg-gradient-to-t from-[#4D201B] via-[#93410B] to-[#4D201B]">
        <div className="pointer-events-auto absolute left-1/2 top-8 z-20 flex -translate-x-1/2 items-center gap-3">
          <SuperpowerLogo fill="white" className="mt-1" />
        </div>
        <div className="absolute inset-0 z-10 overflow-visible p-6">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
            {animate ? (
              <ProgressCircle
                value={metrics.biologicalAge}
                animate
                progressMax={100}
                animationDuration={REVEAL_DURATION}
                easing={REVEAL_EASING}
                className="size-64 text-white lg:size-[320px]"
                borderCircles={[
                  {
                    strokeWidth: 6,
                    lgStrokeWidth: 4,
                    color: 'white',
                    blur: 'blur-[2px] lg:blur-sm',
                  },
                  {
                    strokeWidth: 28,
                    lgStrokeWidth: 64,
                    color: '#facc15',
                    blur: 'blur-2xl',
                  },
                ]}
              >
                <div className="duration-1000 animate-in fade-in">
                  <H4 className="text-center font-bold text-white">
                    biological age
                  </H4>
                  <Body1 className="text-center text-white/80">
                    {Math.abs(metrics.ageDifference)} years{' '}
                    {metrics.isBiologicallyYounger ? 'younger' : 'older'}
                  </Body1>
                </div>
              </ProgressCircle>
            ) : (
              <Skeleton className="mx-auto size-64 rounded-full bg-white/10 lg:size-[320px]" />
            )}
          </div>
          <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex w-full flex-col items-center bg-gradient-to-b from-transparent via-black/40 to-black/60 px-6 py-24 lg:pb-[5vw] lg:pt-[10vw]">
            {animate ? (
              <>
                <H2 className="mb-2 text-center text-white animate-in fade-in">
                  Your biological age is {metrics.biologicalAge.toFixed(1)}
                </H2>
                <Body1 className="mb-8 max-w-lg text-center text-white/80 delay-100 animate-in fade-in">
                  You are {Math.abs(metrics.ageDifference)} years{' '}
                  {metrics.isBiologicallyYounger ? 'younger' : 'older'} than
                  your chronological age!
                </Body1>
                <div className="flex w-full max-w-sm flex-col gap-3">
                  <Button
                    variant="ghost"
                    className="w-full rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={onClose}
                  >
                    Dismiss
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Skeleton className="mx-auto h-12 w-64 rounded-xl bg-white/10" />
                <Skeleton className="mx-auto h-12 w-40 rounded-xl bg-white/10" />
                <Skeleton className="mx-auto h-16 w-72 rounded-full bg-white/10" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
