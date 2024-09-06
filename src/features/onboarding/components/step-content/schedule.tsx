import { ArrowUpRight } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useStepper } from '@/components/ui/stepper';
import { Body1, H2 } from '@/components/ui/typography';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';

export const Schedule = () => {
  const { nextOnboardingStep } = useStepper((s) => s);
  return (
    <section id="main">
      <div className="mb-4 flex flex-col gap-8">
        <H2 className="text-zinc-900">Schedule your first blood test</H2>
        <div className="flex flex-col gap-6">
          <Body1 className="text-[#71717A]">
            Schedule you first blood test in one of our 2,000 partner labs or
            from the comfort of your home with one of our private nursing
            partners.
          </Body1>
          <Body1 className="text-[#71717A]">
            Biomarker levels are most accurate in the morning and you will need
            to fast for 10 hours before the blood draw, so we recommend
            scheduling your visit early in the day.
          </Body1>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <Body1 className="text-[#71717A]">You can view the</Body1>
            <a
              href="https://superpower.com/biomarkers"
              target="_blank"
              rel="noreferrer"
              className="flex flex-row items-center space-x-1 text-sm text-[#FC5F2B]"
            >
              <span>full list of biomarkers test here</span>
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-end py-12">
        <Button onClick={nextOnboardingStep}>Continue</Button>
      </div>
    </section>
  );
};

export const ScheduleStep = () => (
  <ImageContentLayout
    title="Schedule"
    className="bg-female-stretching"
    blockBackButton
  >
    <Schedule />
  </ImageContentLayout>
);
