import { defineStepper } from '@stepperize/react';

export const CANCEL_STEPS = {
  BENEFITS: 'benefits',
  CONFIRMATION: 'confirmation',
  GOT_IT: 'got-it',
} as const satisfies Record<string, string>;

export const CancelMembershipStepper = defineStepper(
  { id: CANCEL_STEPS.BENEFITS },
  { id: CANCEL_STEPS.CONFIRMATION },
  { id: CANCEL_STEPS.GOT_IT },
);
