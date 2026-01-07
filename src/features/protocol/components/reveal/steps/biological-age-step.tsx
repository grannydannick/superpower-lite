import { useCallback, useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H2, H4 } from '@/components/ui/typography';
import { useBiologicalAge } from '@/features/data/hooks/use-biological-age';

import { ScoreCounter } from '../score-counter';
import { VideoSequence } from '../video-sequence';

type BiologicalAgeStepProps = {
  next: () => void;
  previous: () => void;
};

export function BiologicalAgeStep({ next }: BiologicalAgeStepProps) {
  const [showSequence, setShowSequence] = useState(true);
  const { biologicalAge, ageDifference, isYounger, isLoading } =
    useBiologicalAge();

  const handleComplete = useCallback(() => setShowSequence(false), []);

  if (showSequence) {
    return <VideoSequence onComplete={handleComplete} />;
  }

  return (
    <div className="h-screen w-full bg-black">
      <div className="relative size-full bg-[url(/action-plan/intro/leaf.webp)] bg-cover bg-center animate-in fade-in">
        <SuperpowerLogo
          className="absolute left-1/2 top-8 z-10 -translate-x-1/2 lg:hidden"
          fill="white"
        />
        <div className="absolute inset-0 z-10 p-6">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="mx-auto size-80 rounded-full bg-white/10 lg:size-[512px]" />
            ) : (
              <ScoreCounter value={biologicalAge ?? 0} animate={false}>
                <div className="flex flex-col justify-center duration-1000 animate-in fade-in">
                  <H4 className="text-center font-bold text-white">
                    biological age
                  </H4>
                  {ageDifference !== null && (
                    <Body1 className="text-center text-white/80">
                      {Math.abs(ageDifference)} years{' '}
                      {isYounger ? 'younger' : 'older'}
                    </Body1>
                  )}
                </div>
              </ScoreCounter>
            )}
          </div>
          <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex w-full flex-col items-center bg-gradient-to-b from-transparent via-black/80 to-black/90 px-6 py-24 lg:pb-[5vw] lg:pt-[10vw]">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="mx-auto h-12 w-64 rounded-xl bg-white/10" />
                <Skeleton className="mx-auto h-12 w-40 rounded-xl bg-white/10" />
                <Skeleton className="mx-auto h-16 w-72 rounded-full bg-white/10" />
              </div>
            ) : (
              <>
                <H2 className="mb-2 text-center text-white animate-in fade-in">
                  Your biological age is {biologicalAge}
                </H2>
                {ageDifference !== null && (
                  <Body1 className="mb-8 max-w-lg text-center text-white/80 delay-100 animate-in fade-in">
                    You are {Math.abs(ageDifference)} years{' '}
                    {isYounger ? 'younger' : 'older'} than your chronological
                    age!
                  </Body1>
                )}
                <Button
                  variant="glass-outline"
                  className="w-full max-w-sm rounded-full"
                  onClick={next}
                >
                  Continue
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    </div>
  );
}
