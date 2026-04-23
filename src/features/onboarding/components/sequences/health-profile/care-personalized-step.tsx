import { useEffect } from 'react';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';
import { AnimatedHeadline } from '../../shared/animated-headline';

export const CarePersonalizedStep = () => {
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
        <AnimatedHeadline>Your care should be too.</AnimatedHeadline>
      </div>
    </Sequence.StepLayout>
  );
};
