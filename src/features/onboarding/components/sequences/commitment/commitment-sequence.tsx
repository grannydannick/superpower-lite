import { AnimatePresence, m } from 'framer-motion';

import { Head } from '@/components/seo';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import {
  useScreenSequence,
  SequenceProvider,
} from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

import { InitialStep } from './initial-step';
import { ReadyStep } from './ready-step';
import { SignatureStep } from './signature-step';

const FADE_TRANSITION = { duration: 0.2 };

const STEPS = [InitialStep, ReadyStep, SignatureStep] as const;

export const CommitmentSequence = () => {
  const { next: exitSequence } = useOnboardingNavigation();

  const { Screen, screenIndex, sequenceValue } = useScreenSequence({
    screens: STEPS,
    onComplete: exitSequence,
  });

  return (
    <SequenceProvider value={sequenceValue}>
      <Head title="Commitment" />
      <Sequence.Layout>
        <AnimatePresence mode="wait">
          <m.div
            key={screenIndex}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_TRANSITION}
          >
            <Screen />
          </m.div>
        </AnimatePresence>
      </Sequence.Layout>
    </SequenceProvider>
  );
};
