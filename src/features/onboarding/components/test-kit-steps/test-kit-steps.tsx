import { AnimatePresence } from 'framer-motion';
import React from 'react';

import { TEST_KIT_STEPS, TestKitStepper } from './test-kit-stepper';

import * as Steps from './index';

export const TestKitSteps = () => {
  return (
    <TestKitStepper.Scoped>
      <TestKitStepsContent />
    </TestKitStepper.Scoped>
  );
};

const TestKitStepsContent = (): React.ReactElement => {
  const methods = TestKitStepper.useStepper();

  return (
    <AnimatePresence>
      <React.Fragment>
        {methods.switch({
          [TEST_KIT_STEPS.COVER]: () => <Steps.CoverStep />,
          [TEST_KIT_STEPS.SELECT_GUT]: () => <Steps.SelectGutStep />,
          // TODO: re-enable when we switch to new toxin service. determine if NY/NJ is still blocked.
          // [TEST_KIT_STEPS.SELECT_TOXINS]: () => <Steps.SelectToxinsStep />,
          [TEST_KIT_STEPS.CHECKOUT]: () => <Steps.CheckoutStep />,
        })}
      </React.Fragment>
    </AnimatePresence>
  );
};
