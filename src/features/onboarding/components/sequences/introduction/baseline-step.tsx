import { TransitionWrapper } from '@/components/shared/transition-wrapper';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

export const BaselineStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia>
        <TransitionWrapper type="fade-in" delay={0.25}>
          <img
            src="/onboarding/introduction/baseline-test.webp"
            alt="Test your baseline"
            className="h-auto max-h-80 w-full rounded-2xl"
          />
        </TransitionWrapper>
      </Sequence.StepMedia>
      <Sequence.StepContent className="mx-auto max-w-md text-center">
        <H2>Test your baseline</H2>
        <Body1 className="text-zinc-500">
          Superpower starts with a test beyond a basic check-up with more
          insights than ever before.
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
