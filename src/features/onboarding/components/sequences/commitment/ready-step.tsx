import { useEffect } from 'react';

import { ShimmerDune } from '@/components/ui/shimmer-dune';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';
import { AnimatedHeadline } from '../../shared/animated-headline';

export const ReadyStep = () => {
  const { next } = useSequence();

  useEffect(() => {
    const timer = setTimeout(() => {
      next();
    }, 3500);

    return () => clearTimeout(timer);
  }, [next]);

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepContent className="-mt-48 flex flex-1 flex-col items-center justify-center text-center">
        <ShimmerDune />
        <AnimatedHeadline>Are you ready to be your best self?</AnimatedHeadline>
      </Sequence.StepContent>
    </Sequence.StepLayout>
  );
};
