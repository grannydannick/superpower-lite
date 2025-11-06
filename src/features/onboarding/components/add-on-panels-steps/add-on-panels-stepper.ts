import { defineStepper } from '@stepperize/react';

export const ADD_ON_PANELS_STEPS = {
  ORGAN_AGE: 'organ-age',
  ADD_ON_PANELS: 'add-on-panels',
} as const satisfies Record<string, string>;

export const AddOnPanelsStepper = defineStepper(
  { id: ADD_ON_PANELS_STEPS.ORGAN_AGE },
  { id: ADD_ON_PANELS_STEPS.ADD_ON_PANELS },
);
