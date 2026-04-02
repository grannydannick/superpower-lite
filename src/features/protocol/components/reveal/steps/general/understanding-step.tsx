import { format } from 'date-fns';
import { m } from 'framer-motion';
import { useCallback, useMemo } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { Body4 } from '@/components/ui/typography/body4/body4';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';
import { useGender } from '@/hooks/use-gender';
import { useUser } from '@/lib/auth';

import { ProtocolStepLayout } from '../../../layouts/protocol-step-layout';

export const UnderstandingStep = () => {
  const { next, healthWinners, areasToImprove, biomarkers } =
    useProtocolStepperContext();
  const { data: user } = useUser();
  const { gender } = useGender();

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  // Extract Biological Age and Health Score from biomarkers
  // Assumes latest results are being shown
  const biologicalAge = useMemo(() => {
    const marker = biomarkers.find((b) => b.name === 'Biological Age');
    return marker?.value?.[0]?.quantity?.value ?? null;
  }, [biomarkers]);

  const superpowerScore = useMemo(() => {
    const marker = biomarkers.find((b) => b.name === 'Health Score');
    return marker?.value?.[0]?.quantity?.value ?? null;
  }, [biomarkers]);

  const userName = user ? `${user.firstName} ${user.lastName}` : '--';
  const joinedDate = user?.createdAt
    ? format(new Date(user.createdAt), 'MMMM yyyy')
    : '--';

  return (
    <ProtocolStepLayout fullWidth>
      <div className="media-organic-reveal relative flex flex-1 items-end justify-center">
        <div className="absolute inset-4 left-1/2 w-screen max-w-xl -translate-x-1/2 bg-[url('/protocol/sports.webp')] bg-cover bg-center rounded-mask" />
        <div className="relative z-10 w-full max-w-md p-6">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative mx-auto -mb-2 mt-8 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 pb-2 shadow shadow-black/[.03] md:mb-24 md:-rotate-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4">
                  <div>
                    <H4 className="mb-6 text-xl font-semibold">{userName}</H4>

                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
                      <Body1 className="bg-gradient-to-t from-vermillion-900 to-vermillion-500 bg-clip-text font-semibold tabular-nums text-transparent">
                        {biologicalAge ?? '--'}
                      </Body1>
                      <Body2 className="whitespace-nowrap text-secondary">
                        Biological Age
                      </Body2>

                      <Body1 className="bg-gradient-to-t from-vermillion-900 to-vermillion-500 bg-clip-text font-semibold tabular-nums text-transparent">
                        {superpowerScore ?? '--'}
                      </Body1>
                      <Body2 className="whitespace-nowrap text-secondary">
                        Superpower Score
                      </Body2>

                      <Body1 className="bg-gradient-to-t from-vermillion-900 to-vermillion-500 bg-clip-text font-semibold tabular-nums text-transparent">
                        {healthWinners.length}
                      </Body1>
                      <Body2 className="whitespace-nowrap text-secondary">
                        Health Winners
                      </Body2>

                      <Body1 className="bg-gradient-to-t from-vermillion-900 to-vermillion-500 bg-clip-text font-semibold tabular-nums text-transparent">
                        {areasToImprove.length}
                      </Body1>
                      <Body2 className="whitespace-nowrap text-secondary">
                        Improvement Areas
                      </Body2>
                    </div>
                  </div>
                  <img
                    src={`/protocol/twins/${gender === 'female' ? 'female' : 'male'}-twin-neutral.png`}
                    className="ml-auto max-w-32 pt-4 rounded-mask"
                    alt=""
                  />
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Body4 className="text-xs text-zinc-400">
                    Joined {joinedDate}
                  </Body4>
                  <SuperpowerLogo className="ml-auto max-w-20 opacity-30" />
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 text-center">
        <H2 className="mb-2 text-balance">
          We have a comprehensive understanding of your health
        </H2>
        <Body1 className="text-secondary">
          This includes your goals, preferences, biomarker data, and additional
          tests.
        </Body1>
      </div>

      <div className="flex w-full justify-center px-4">
        <Button onClick={handleNext} className="mx-auto w-full max-w-md">
          Next
        </Button>
      </div>
    </ProtocolStepLayout>
  );
};
