import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';
import { ImageWithReveal } from '../../shared/image-with-reveal';

export const BaselineStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia>
        <ImageWithReveal
          src="/onboarding/introduction/baseline-test.webp"
          alt="Test your baseline"
          className="h-auto max-h-80 w-full rounded-2xl"
        />
      </Sequence.StepMedia>
      <Sequence.StepContent className="mx-auto max-w-md text-center">
        <H2>You're testing 100+ biomarkers</H2>
        <Body1 className="text-zinc-500">
          That's 10x more than a typical checkup, so we can find signals and see
          trends normally missed.
        </Body1>
      </Sequence.StepContent>
      <Sequence.StepFooter>
        <Button onClick={next} className="mx-auto w-full max-w-md">
          Next
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
