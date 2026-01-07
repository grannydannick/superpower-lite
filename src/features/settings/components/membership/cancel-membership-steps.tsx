import React from 'react';

import {
  CANCEL_STEPS,
  CancelMembershipStepper,
} from './cancel-membership-stepper';
import { BenefitsStep } from './steps/benefits';
import { ConfirmationStep } from './steps/confirmation';
import { GotItStep } from './steps/got-it';

export const CancelMembershipSteps = () => {
  return (
    <CancelMembershipStepper.Scoped>
      <CancelMembershipStepsContent />
    </CancelMembershipStepper.Scoped>
  );
};

const CancelMembershipStepsContent = (): React.ReactElement => {
  const methods = CancelMembershipStepper.useStepper();

  return (
    <React.Fragment>
      {methods.switch({
        [CANCEL_STEPS.BENEFITS]: () => <BenefitsStep />,
        [CANCEL_STEPS.CONFIRMATION]: () => <ConfirmationStep />,
        [CANCEL_STEPS.GOT_IT]: () => <GotItStep />,
      })}
    </React.Fragment>
  );
};
