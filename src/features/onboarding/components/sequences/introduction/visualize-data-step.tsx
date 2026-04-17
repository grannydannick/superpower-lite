import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';
import { ImageWithReveal } from '../../shared/image-with-reveal';

export const VisualizeDataStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia>
        <ImageWithReveal
          src="/onboarding/introduction/data-visualization.webp"
          alt="Visualize your data"
          className="h-auto max-h-96 w-full rounded-2xl"
        />
      </Sequence.StepMedia>
      <Sequence.StepContent className="mx-auto max-w-md text-center">
        <H2>Visualize your health</H2>
        <Body1 className="text-zinc-500">
          Your data and ranges are plotted against people like you, not the
          general population.
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
