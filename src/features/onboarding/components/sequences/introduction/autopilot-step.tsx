import { TransitionWrapper } from '@/components/shared/transition-wrapper';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

export const AutopilotStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia>
        <TransitionWrapper type="fade-in" delay={0.25}>
          <img
            src="/onboarding/introduction/autopilot.webp"
            alt="Autopilot your health"
            className="h-auto w-full md:rounded-mask"
          />
        </TransitionWrapper>
      </Sequence.StepMedia>
      <Sequence.StepContent className="mx-auto max-w-md text-center">
        <H2>Autopilot your health</H2>
        <Body1 className="text-zinc-500">
          Your plan updates as your body changes, without you thinking about it.
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
