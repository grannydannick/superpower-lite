import { TransitionWrapper } from '@/components/shared/transition-wrapper';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

export const VisualizeDataStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia>
        <TransitionWrapper type="fade-in" delay={0.25}>
          <img
            src="/onboarding/introduction/data-visualization.webp"
            alt="Visualize your data"
            className="h-auto max-h-96 w-full rounded-2xl"
          />
        </TransitionWrapper>
      </Sequence.StepMedia>
      <Sequence.StepContent className="mx-auto max-w-md text-center">
        <H2>Visualize your data</H2>
        <Body1 className="text-zinc-500">
          For the first time ever see your whole body&apos;s health and detect
          issues before they arrive.
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
