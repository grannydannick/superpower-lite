import { AnimatePresence, motion } from 'framer-motion';

import { Head } from '@/components/seo';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import {
  useScreenSequence,
  SequenceProvider,
} from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

import { ChecklistStep } from './checklist-step';
import { IntroStep } from './intro-step';

const FADE_TRANSITION = { duration: 0.2 };

const STEPS = [IntroStep, ChecklistStep] as const;

export const FinishTwinSequence = () => {
  const { next: exitSequence, prev: exitBack } = useOnboardingNavigation();

  const { Screen, screenIndex, sequenceValue } = useScreenSequence({
    screens: STEPS,
    onComplete: exitSequence,
    onBack: exitBack,
  });

  return (
    <SequenceProvider value={sequenceValue}>
      <Head title="Complete Your Digital Twin" />
      <Sequence.Layout>
        <Sequence.ProgressHeader />
        <AnimatePresence mode="wait">
          <motion.div
            key={screenIndex}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_TRANSITION}
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </Sequence.Layout>
    </SequenceProvider>
  );
};
