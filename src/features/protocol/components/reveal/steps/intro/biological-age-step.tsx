import { Info } from 'lucide-react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H2, H4 } from '@/components/ui/typography';
import { BiologicalAgeDialog } from '@/features/data/components/dialogs/biological-age-dialog';
import { useBiologicalAge } from '@/features/data/hooks/use-biological-age';
import { BioAgeArc } from '@/features/homepage/components/score-cards/score-card-arcs';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';

const BIOLOGICAL_AGE_RING_SIZE = 220;

export const BiologicalAgeStep = () => {
  const { next } = useProtocolStepperContext();
  const { biologicalAge, ageDifference, isYounger, isLoading } =
    useBiologicalAge();

  return (
    <div className="h-screen w-full bg-emerald-950">
      <div
        className="relative size-full overflow-hidden bg-cover bg-center animate-in fade-in"
        style={{ backgroundImage: "url('/cards/age-card.webp')" }}
      >
        <div className="absolute inset-0 bg-emerald-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/55 to-emerald-700/35" />
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
              <div className="relative scale-110 lg:scale-[1.35]">
                <BioAgeArc
                  bioAge={biologicalAge ?? 0}
                  realAge={
                    biologicalAge == null || ageDifference == null
                      ? (biologicalAge ?? 0)
                      : biologicalAge + ageDifference
                  }
                  size={BIOLOGICAL_AGE_RING_SIZE}
                  showGlow
                />
                <div className="absolute inset-0 flex -translate-y-1 flex-col items-center justify-center text-white">
                  <span className="-mt-2 text-5xl font-medium leading-none lg:text-6xl">
                    {biologicalAge?.toFixed(1) ?? '0.0'}
                  </span>
                  <H4 className="mt-1 text-center font-bold text-white">
                    biological age
                  </H4>
                  {ageDifference !== null && (
                    <Body1 className="text-center text-white/80">
                      {Math.abs(ageDifference)} years{' '}
                      {isYounger ? 'younger' : 'older'}
                    </Body1>
                  )}
                </div>
              </div>
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
