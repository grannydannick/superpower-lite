import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

/**
 * IntroStep - First screen in upsell sequence
 *
 * Unlike other preview screens, this has a light background on BOTH mobile and desktop.
 * Uses contained rounded image (not full-bleed) on all breakpoints.
 */
export const IntroStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered className="bg-zinc-50">
      <div className="fixed left-0 top-0 z-20 hidden w-full px-10 py-2 md:flex md:h-14 md:items-center">
        <SuperpowerLogo className="h-4 w-[122px]" />
      </div>

      <div className="flex-1 md:hidden md:pt-[130px]">
        <img
          src="/onboarding/upsell/intro/upsell-intro.webp"
          alt=""
          className="h-[360px] w-full object-cover"
        />
      </div>

      <div className="hidden md:flex md:flex-col md:items-center">
        <img
          src="/onboarding/upsell/intro/upsell-intro.webp"
          alt=""
          className="size-auto max-h-[350px] rounded-mask"
        />
      </div>

      <Sequence.StepContent className="space-y-1 text-center md:mx-auto md:w-full md:max-w-md md:space-y-[17px] md:px-0 md:pt-6">
        <H2 className="text-balance">Go beyond your baseline</H2>
        <Body1 className="text-zinc-500">
          Explore additional tests that go deeper into the areas that matter
          most.
        </Body1>
      </Sequence.StepContent>

      <Sequence.StepFooter className="md:mx-auto md:mt-4 md:w-full md:max-w-md md:px-0">
        <Button onClick={next} className="w-full">
          Build your testing plan
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
