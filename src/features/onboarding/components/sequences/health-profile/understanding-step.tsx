import { useEffect } from 'react';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';
import { AnimatedHeadline } from '../../shared/animated-headline';

export const UnderstandingStep = () => {
  const { next } = useSequence();

  useEffect(() => {
    const timer = setTimeout(() => {
      next();
    }, 2500);

    return () => clearTimeout(timer);
  }, [next]);

  return (
    <Sequence.StepLayout centered className="max-h-screen justify-center">
      <div className="flex flex-1 items-center justify-center">
        <AnimatedHeadline>So we start by understanding you.</AnimatedHeadline>
      </div>
    </Sequence.StepLayout>
  );
};
