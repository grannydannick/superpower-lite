import { useEffect } from 'react';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';
import { AnimatedHeadline } from '../../shared/animated-headline';

const TIME_TO_WAIT = 5000;

export const OutroStep = () => {
  const { next } = useSequence();

  useEffect(() => {
    const timer = setTimeout(() => {
      next();
    }, TIME_TO_WAIT);

    return () => clearTimeout(timer);
  }, [next]);

  return (
    <Sequence.StepLayout centered className="max-h-screen justify-center">
      <div className="flex flex-1 items-center justify-center">
        <AnimatedHeadline>Configuring profile...</AnimatedHeadline>
      </div>
    </Sequence.StepLayout>
  );
};
