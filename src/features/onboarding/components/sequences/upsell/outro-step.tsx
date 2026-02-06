import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

export const OutroStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia className="flex items-center justify-center">
        <img
          src="/onboarding/upsell/curated-diagnostics.webp"
          alt="Curated diagnostics"
          className="h-auto w-full rounded-mask md:-mb-32"
        />
      </Sequence.StepMedia>
      <Sequence.StepContent className="mx-auto max-w-md text-center">
        <H2>Go deeper with curated diagnostics</H2>
        <Body1 className="text-zinc-500">
          Your membership offers a marketplace of testing solutions trusted by
          top doctors all-in-one place.
        </Body1>
      </Sequence.StepContent>
      <Sequence.StepFooter>
        <Button onClick={next} className="mx-auto w-full max-w-md">
          Build your testing plan
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
