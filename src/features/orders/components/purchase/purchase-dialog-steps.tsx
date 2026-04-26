import React, { useEffect } from 'react';

import {
  PURCHASE_DIALOG_STEPS,
  usePurchaseDialogStepper,
} from './purchase-dialog-stepper';
import * as Steps from './steps';

export const PurchaseDialogSteps = () => {
  const methods = usePurchaseDialogStepper();

  useEffect(() => {
    const currentId = methods.state.current.data.id;
    let isCurrentStepValid = false;
    for (const step of methods.validSteps) {
      if (step.id === currentId) {
        isCurrentStepValid = true;
        break;
      }
    }
    if (isCurrentStepValid) {
      return;
    }
    if (methods.validSteps.length === 0) {
      return;
    }
    void methods.navigation.goTo(methods.validSteps[0].id);
  }, [methods]);

  const currentId = methods.state.current.data.id;
  const isCurrentStepValid = methods.validSteps.some((s) => s.id === currentId);
  if (!isCurrentStepValid) return null;

  return (
    <React.Fragment>
      {methods.flow.switch({
        [PURCHASE_DIALOG_STEPS.INFORMED_CONSENT]: () => (
          <Steps.InformedConsentStep />
        ),
        [PURCHASE_DIALOG_STEPS.EARLY_ACCESS]: () => (
          <Steps.RequestEarlyAccessStep />
        ),
        [PURCHASE_DIALOG_STEPS.SUMMARY]: () => <Steps.PurchaseSummaryStep />,
        [PURCHASE_DIALOG_STEPS.SUCCESS]: () => <Steps.PurchaseSuccessStep />,
      })}
    </React.Fragment>
  );
};
