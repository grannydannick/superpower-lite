import { defineStepper } from '@stepperize/react';

export const TEST_KIT_STEPS = {
  COVER: 'cover',
  SELECT_GUT: 'select-gut',
  SELECT_TOXINS: 'select-toxins',
  CHECKOUT: 'checkout',
} as const satisfies Record<string, string>;

export const TestKitStepper = defineStepper(
  { id: TEST_KIT_STEPS.COVER },
  { id: TEST_KIT_STEPS.SELECT_GUT },
  // TODO: re-enable when we switch to new toxin service. determine if NY/NJ is still blocked.
  // { id: TEST_KIT_STEPS.SELECT_TOXINS },
  { id: TEST_KIT_STEPS.CHECKOUT },
);
