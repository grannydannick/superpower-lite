import { AnimatePresence, m } from 'framer-motion';

import { Head } from '@/components/seo';
import {
  getOnboardingStepTitle,
  ONBOARDING_STEP_IDS,
} from '@/features/onboarding/components/flow/onboarding-step-manifest';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import {
  useScreenSequence,
  SequenceProvider,
} from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

import { BiologyUniqueStep } from './biology-unique-step';
import { CarePersonalizedStep } from './care-personalized-step';
import { UnderstandingStep } from './understanding-step';

const FADE_TRANSITION = { duration: 0.2 };

const STEPS = [
  BiologyUniqueStep,
  CarePersonalizedStep,
  UnderstandingStep,
] as const;

export const HealthProfileSequence = () => {
  const { next: exitSequence } = useOnboardingNavigation();

  const { Screen, screenIndex, sequenceValue } = useScreenSequence({
    screens: STEPS,
    onComplete: exitSequence,
  });

  return (
    <SequenceProvider value={sequenceValue}>
      <Head
        title={getOnboardingStepTitle(ONBOARDING_STEP_IDS.HEALTH_PROFILE)}
      />
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
