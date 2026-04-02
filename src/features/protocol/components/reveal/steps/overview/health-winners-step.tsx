import { m } from 'framer-motion';
import { useCallback } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { MiniScoreChart } from '@/components/ui/charts/mini-donut-chart/mini-donut-chart';
import { Body1, H2 } from '@/components/ui/typography';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';
import { useGender } from '@/hooks/use-gender';
import { useUser } from '@/lib/auth';

import { ProtocolStepLayout } from '../../../layouts/protocol-step-layout';

export const HealthWinnersStep = () => {
  const { next, healthWinners, totalCategoryCount } =
    useProtocolStepperContext();
  const { data } = useUser();
  const { gender } = useGender();

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  const hasWinners = healthWinners.length > 0;

  return (
    <ProtocolStepLayout>
      <div>
        <H2 className="mb-1 text-center md:text-3xl">Your health winners</H2>
        <Body1 className="mb-6 text-balance text-center text-secondary">
          {hasWinners
            ? `${healthWinners.length} out of ${totalCategoryCount} health categories are doing exceptionally great!`
            : 'Keep going — your health winners will show up here!'}
        </Body1>
      </div>
      <div className="relative max-w-md space-y-8 rounded-2xl bg-gradient-to-t from-white via-white to-green-50/20 p-6 pt-0 shadow shadow-black/[.03] duration-700 ease-out animate-in fade-in slide-in-from-bottom-4">
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-black/10" />
        <div className="flex w-full flex-wrap justify-between gap-4">
          <Body1 className="text-secondary">
            {data?.firstName} {data?.lastName}
          </Body1>
          <SuperpowerLogo className="mt-1 h-5 w-fit opacity-50" />
        </div>
        <m.img
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          src={`/protocol/twins/${gender === 'female' ? 'female' : 'male'}-twin-green.png`}
          alt=""
          className="min-h-48 w-full"
          style={{
            maskImage:
              'linear-gradient(to bottom, black 75%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 75%, transparent 100%)',
          }}
        />
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          {hasWinners ? (
            healthWinners.map((winner) => (
              <div
                key={winner.category}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 pr-3 shadow"
              >
                <MiniScoreChart value={winner.value} />
                <p className="text-secondary">{winner.category}</p>
              </div>
            ))
          ) : (
            <p className="text-secondary">No categories rated A yet</p>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <Button className="w-full" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </ProtocolStepLayout>
  );
};
