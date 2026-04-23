import { useEffect } from 'react';

import { Sequence } from '@/features/onboarding/components/sequence';
import { AnimatedHeadline } from '@/features/onboarding/components/shared/animated-headline';
import { useSequence } from '@/features/onboarding/hooks/use-screen-sequence';

export const BiologyUniqueStep = () => {
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
        <AnimatedHeadline>Your biology is unique.</AnimatedHeadline>
      </div>
    </Sequence.StepLayout>
  );
};
