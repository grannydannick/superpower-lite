import { defineStepper } from '@stepperize/react';

import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  CONTINUOUS_GLUCOSE_MONITOR,
  GUT_MICROBIOME_ANALYSIS,
  TOTAL_TOXIN_TEST,
  ENVIRONMENTAL_TOXINS_TEST,
  MYCOTOXINS_TEST,
  HEAVY_METALS_TEST,
} from '@/const';

import { usePurchaseStore } from '../../stores/purchase-store';

export const PURCHASE_DIALOG_STEPS = {
  INFORMED_CONSENT: 'informed-consent',
  SUMMARY: 'summary',
  SUCCESS: 'success',
  EARLY_ACCESS: 'early-access',
} as const satisfies Record<string, string>;

export const PurchaseDialogStepper = defineStepper(
  { id: PURCHASE_DIALOG_STEPS.EARLY_ACCESS },
  { id: PURCHASE_DIALOG_STEPS.INFORMED_CONSENT },
  { id: PURCHASE_DIALOG_STEPS.SUMMARY },
  { id: PURCHASE_DIALOG_STEPS.SUCCESS },
);

type PurchaseDialogStepId =
  (typeof PURCHASE_DIALOG_STEPS)[keyof typeof PURCHASE_DIALOG_STEPS];

interface PurchaseDialogStep {
  id: PurchaseDialogStepId;
}

type PurchaseDialogStepperUseStepperType = ReturnType<
  typeof PurchaseDialogStepper.useStepper
>;

interface UsePurchaseDialogStepperType extends PurchaseDialogStepperUseStepperType {
  validSteps: PurchaseDialogStep[];
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  prev: () => void;
}

export const usePurchaseDialogStepper = (): UsePurchaseDialogStepperType => {
  const service = usePurchaseStore((s) => s.service);

  const methods = PurchaseDialogStepper.useStepper();

  let steps: PurchaseDialogStep[] = [];

  switch (service.name) {
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
    case CONTINUOUS_GLUCOSE_MONITOR:
    case GUT_MICROBIOME_ANALYSIS:
    case TOTAL_TOXIN_TEST:
    case ENVIRONMENTAL_TOXINS_TEST:
    case MYCOTOXINS_TEST:
    case HEAVY_METALS_TEST:
      steps = [
        { id: PURCHASE_DIALOG_STEPS.INFORMED_CONSENT },
        { id: PURCHASE_DIALOG_STEPS.SUMMARY },
        { id: PURCHASE_DIALOG_STEPS.SUCCESS },
      ];
      break;
    default:
      steps = [
        { id: PURCHASE_DIALOG_STEPS.SUMMARY },
        { id: PURCHASE_DIALOG_STEPS.SUCCESS },
      ];
  }

  const validSteps: PurchaseDialogStep[] = service.active
    ? steps
    : [{ id: PURCHASE_DIALOG_STEPS.EARLY_ACCESS }];

  const getCurrentIndex = () =>
    validSteps.findIndex((step) => step.id === methods.state.current.data.id);

  const next = () => {
    const idx = getCurrentIndex();
    if (idx === -1) return;

    const nextStep = validSteps[idx + 1];
    if (!nextStep) return;

    void methods.navigation.goTo(nextStep.id);
  };

  const prev = () => {
    const idx = getCurrentIndex();
    if (idx === -1) return;

    const prevStep = validSteps[idx - 1];
    if (!prevStep) return;

    void methods.navigation.goTo(prevStep.id);
  };

  const currentIndex = getCurrentIndex();
  const isLast = currentIndex === validSteps.length - 1;
  const isFirst = currentIndex <= 0;

  return {
    ...methods,
    currentIndex,
    next,
    prev,
    isFirst,
    isLast,
    validSteps,
  };
};
