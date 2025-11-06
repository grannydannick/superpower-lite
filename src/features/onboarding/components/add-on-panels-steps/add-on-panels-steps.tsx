import { AnimatePresence } from 'framer-motion';
import React from 'react';

import {
  ADD_ON_PANELS_STEPS,
  AddOnPanelsStepper,
} from './add-on-panels-stepper';

import * as Steps from './index';

export const AddOnPanelsSteps = () => {
  return (
    <AddOnPanelsStepper.Scoped>
      <AddOnPanelsStepsContent />
    </AddOnPanelsStepper.Scoped>
  );
};

const AddOnPanelsStepsContent = (): React.ReactElement => {
  const methods = AddOnPanelsStepper.useStepper();

  return (
    <AnimatePresence>
      <React.Fragment>
        {methods.switch({
          [ADD_ON_PANELS_STEPS.ADD_ON_PANELS]: () => <Steps.AddOnPanelsStep />,
          [ADD_ON_PANELS_STEPS.ORGAN_AGE]: () => <Steps.OrganAgeStep />,
        })}
      </React.Fragment>
    </AnimatePresence>
  );
};
