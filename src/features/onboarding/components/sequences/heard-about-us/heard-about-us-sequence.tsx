import { AnimatePresence, m } from 'framer-motion';

import { Head } from '@/components/seo';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import {
  useScreenSequence,
  SequenceProvider,
} from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

import { HeardAboutUsStep } from './heard-about-us-step';

const FADE_TRANSITION = { duration: 0.2 };

const STEPS = [HeardAboutUsStep] as const;

export const HeardAboutUsSequence = () => {
  const { next: exitSequence } = useOnboardingNavigation();

  const { Screen, screenIndex, sequenceValue } = useScreenSequence({
    screens: STEPS,
    onComplete: exitSequence,
  });

  return (
    <SequenceProvider value={sequenceValue}>
      <Head title="How Did You Hear About Us?" />
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
