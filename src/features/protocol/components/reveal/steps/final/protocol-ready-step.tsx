import { IconArrowUp } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconArrowUp';
import { IconForkKnife } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconForkKnife';
import { IconMedicinePill } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconMedicinePill';
import { IconPeople } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconPeople';
import { m } from 'framer-motion';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { ProtocolChart } from '@/features/protocol/components/protocol-chart';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';

import { ProtocolStepLayout } from '../../../layouts/protocol-step-layout';

const MOCK_BENEFITS = [
  { id: 'energy', text: 'Boost your energy', icon: IconArrowUp },
  { id: 'clarity', text: 'Increase mental clarity', icon: IconArrowUp },
  { id: 'strength', text: 'Feel stronger', icon: IconArrowUp },
];

const MOCK_INCLUDES = [
  { id: 'lifestyle', text: 'Lifestyle recommendations', icon: IconPeople },
  { id: 'dietary', text: 'Dietary recommendations', icon: IconForkKnife },
  { id: 'supplement', text: 'Supplement suggestions', icon: IconMedicinePill },
];

export const ProtocolReadyStep = () => {
  const { next } = useProtocolStepperContext();

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  return (
    <ProtocolStepLayout fullWidth className="relative">
      <div className="fixed inset-0 z-0 mx-auto">
        <div
          style={{
            maskImage: 'linear-gradient(to top, transparent 30%, black 70%)',
            WebkitMaskImage:
              'linear-gradient(to top, transparent 30%, black 70%)',
          }}
          className="size-full bg-[url('/protocol/final/orange-circle.webp')] bg-cover bg-top"
        />
      </div>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12"
      >
        <div className="mb-8 text-center">
          <H2 className="mb-1 text-white">Your Protocol is ready</H2>
          <Body1 className="text-white/90">
            This is your game plan to improve
            <br />
            your biomarkers and health.
          </Body1>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 w-full max-w-md rounded-[18px] bg-white p-1.5 shadow-xl xs:rounded-[24px]"
        >
          <ProtocolChart />
          <div className="px-4 pb-2">
            <div>
              <Body2 className="mb-3 text-secondary">You will...</Body2>
              <div className="space-y-2">
                {MOCK_BENEFITS.map((benefit) => (
                  <div key={benefit.id} className="flex items-center gap-3">
                    <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20">
                      <benefit.icon className="size-4 text-emerald-500" />
                    </div>
                    <Body2 className="text-primary">{benefit.text}</Body2>
                  </div>
                ))}
              </div>
            </div>
            <hr className="my-4 border-zinc-200" />
            <div className="mb-6">
              <Body2 className="mb-3 text-secondary">Includes...</Body2>
              <div className="space-y-2">
                {MOCK_INCLUDES.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex size-6 items-center justify-center rounded-full bg-vermillion-900/20">
                      <item.icon className="size-4 text-vermillion-900" />
                    </div>
                    <Body2 className="text-primary">{item.text}</Body2>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </m.div>
        <Button className="mx-auto w-full max-w-md" onClick={handleNext}>
          Dive into my protocol
        </Button>
      </m.div>
    </ProtocolStepLayout>
  );
};
