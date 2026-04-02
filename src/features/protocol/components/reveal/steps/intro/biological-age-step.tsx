import { Info } from 'lucide-react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { ProgressCircle } from '@/components/shared/progress-circle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H2, H4 } from '@/components/ui/typography';
import { BiologicalAgeDialog } from '@/features/data/components/dialogs/biological-age-dialog';
import { useBiologicalAge } from '@/features/data/hooks/use-biological-age';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';

export const BiologicalAgeStep = () => {
  const { next } = useProtocolStepperContext();
  const { biologicalAge, ageDifference, isYounger, isLoading } =
    useBiologicalAge();

  return (
    <div className="h-screen w-full bg-black">
      <div className="relative size-full bg-gradient-to-t from-[#4D201B] via-[#93410B] to-[#4D201B] animate-in fade-in">
        <div className="pointer-events-auto absolute left-1/2 top-8 z-20 flex -translate-x-1/2 items-center gap-3">
          <SuperpowerLogo fill="white" className="mt-1" />
          <BiologicalAgeDialog>
            <Button
              variant="ghost"
              size="small"
              className="size-8 p-0 text-white hover:bg-white/20 hover:text-white"
            >
              <Info className="size-4" />
            </Button>
          </BiologicalAgeDialog>
        </div>
        <div className="absolute inset-0 z-10 overflow-visible p-6">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
            {isLoading ? (
              <Skeleton className="mx-auto size-64 rounded-full bg-white/10 lg:size-[320px]" />
            ) : (
              <ProgressCircle
                value={biologicalAge ?? 0}
                animate
                progressMax={100}
                animationDuration={1000}
                easing="cubic-bezier(0.16, 1, 0.3, 1)"
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
                  {ageDifference !== null && (
                    <Body1 className="text-center text-white/80">
                      {Math.abs(ageDifference)} years{' '}
                      {isYounger ? 'younger' : 'older'}
                    </Body1>
                  )}
                </div>
              </ProgressCircle>
            )}
          </div>
          <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex w-full flex-col items-center bg-gradient-to-b from-transparent via-black/40 to-black/60 px-6 py-24 lg:pb-[5vw] lg:pt-[10vw]">
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
      </div>
    </div>
  );
};
