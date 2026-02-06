import { useEffect } from 'react';

import { ShimmerDune } from '@/components/ui/shimmer-dune';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';
import { AnimatedHeadline } from '../../shared/animated-headline';

export const InitialStep = () => {
  const { next } = useSequence();

  useEffect(() => {
    const timer = setTimeout(() => {
      next();
    }, 2500);

    return () => clearTimeout(timer);
  }, [next]);

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepContent className="-mt-48 flex flex-1 flex-col items-center justify-center text-center">
        <ShimmerDune />
        <AnimatedHeadline>It&apos;s time...</AnimatedHeadline>
      </Sequence.StepContent>
    </Sequence.StepLayout>
  );
};
