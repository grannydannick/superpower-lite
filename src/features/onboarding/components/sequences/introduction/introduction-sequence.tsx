import { AnimatePresence, motion } from 'framer-motion';

import { Head } from '@/components/seo';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import {
  useScreenSequence,
  SequenceProvider,
} from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

import { ActionStep } from './action-step';
import { AutopilotStep } from './autopilot-step';
import { BaselineStep } from './baseline-step';
import { IntroStep } from './intro-step';
import { MembershipSummaryStep } from './membership-summary-step';
import { OutroStep } from './outro-step';
import { VisualizeDataStep } from './visualize-data-step';

const FADE_TRANSITION = { duration: 0.2 };

const STEPS = [
  IntroStep,
  BaselineStep,
  VisualizeDataStep,
  ActionStep,
  AutopilotStep,
  MembershipSummaryStep,
  OutroStep,
] as const;

export const IntroductionSequence = () => {
  const { next: exitSequence } = useOnboardingNavigation();

  const { Screen, screenIndex, sequenceValue } = useScreenSequence({
    screens: STEPS,
    onComplete: exitSequence,
  });

  return (
    <SequenceProvider value={sequenceValue}>
      <Head title="Welcome to Superpower" />
      <Sequence.Layout>
        <Sequence.ProgressHeader showBackButton={false} />
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
