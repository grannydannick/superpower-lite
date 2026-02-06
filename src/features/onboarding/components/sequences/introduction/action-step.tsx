import { TransitionWrapper } from '@/components/shared/transition-wrapper';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

export const ActionStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia>
        <TransitionWrapper type="fade-in" delay={0.25}>
          <img
            src="/onboarding/introduction/insights.webp"
            alt="Action on your insights"
            className="h-auto w-full pt-16 rounded-mask"
          />
        </TransitionWrapper>
      </Sequence.StepMedia>
      <Sequence.StepContent className="mx-auto max-w-md text-center">
        <H2>Action on your insights</H2>
        <Body1 className="text-zinc-500">
          Your action plan tells you what matters and exactly what to do next,
          tailored to your biology and goals.
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
