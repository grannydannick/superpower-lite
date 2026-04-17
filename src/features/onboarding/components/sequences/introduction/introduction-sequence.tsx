import { AnimatePresence, m } from 'framer-motion';
import { useEffect } from 'react';

import { Head } from '@/components/seo';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import {
  useScreenSequence,
  SequenceProvider,
} from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

import { ActionStep } from './action-step';
import { BaselineStep } from './baseline-step';
import { IntroStep } from './intro-step';
import { OutroStep } from './outro-step';
import { VisualizeDataStep } from './visualize-data-step';

const FADE_TRANSITION = { duration: 0.2 };

const STEPS = [
  IntroStep,
  BaselineStep,
  VisualizeDataStep,
  ActionStep,
  OutroStep,
] as const;

/**
 * Images keyed by step index. Preload the next step's image while the
 * current step is displayed so it's ready before the transition fires.
 * Index matches STEPS order: 0=Intro, 1=Baseline, 2=VisualizeData, 3=Action, 4=Outro
 */
const STEP_IMAGES: Partial<Record<number, string[]>> = {
  1: ['/onboarding/introduction/baseline-test.webp'],
  2: ['/onboarding/introduction/data-visualization.webp'],
  3: ['/onboarding/introduction/insights.webp'],
};

function usePreloadNextImage(screenIndex: number) {
  useEffect(() => {
    const urls = STEP_IMAGES[screenIndex + 1];
    if (!urls) return;
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [screenIndex]);
}

export const IntroductionSequence = () => {
  const { next: exitSequence } = useOnboardingNavigation();
  const { Screen, screenIndex, sequenceValue } = useScreenSequence({
    screens: STEPS,
    onComplete: exitSequence,
  });
  usePreloadNextImage(screenIndex);

  return (
    <SequenceProvider value={sequenceValue}>
      <Head title="Welcome to Superpower" />
      <Sequence.Layout>
        <Sequence.ProgressHeader showBackButton={false} />
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
