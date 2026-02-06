import { TransitionWrapper } from '@/components/shared/transition-wrapper';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

export const IntroStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia className="flex items-center justify-center">
        <TransitionWrapper type="fade-in" delay={0.25}>
          <img
            src="/onboarding/finish-twin/add-more-context.webp"
            alt="Add more context"
            className="h-auto w-full rounded-mask"
          />
        </TransitionWrapper>
      </Sequence.StepMedia>
      <Sequence.StepContent className="mx-auto max-w-md text-center">
        <H2>
          Add more context,
          <br />
          unlock better insights
        </H2>
        <Body1 className="text-zinc-500">
          The more information you share the better your twin&apos;s insights
          and recommendations will be.
        </Body1>
      </Sequence.StepContent>
      <Sequence.StepFooter>
        <Button onClick={next} className="mx-auto w-full max-w-md">
          Finish setup
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
