import { defineStepper } from '@stepperize/react';

import { useCheckLocation } from '@/hooks/use-check-location';

import { useScheduleStore } from '../../stores/schedule-store';

export const SCHEDULE_STEPS = {
  INTRO: 'intro',
  CREDITS_SELECT: 'credits-select',
  PHLEBOTOMY: 'phlebotomy',
  SCHEDULER: 'scheduler',
  ADVISORY_SCHEDULER: 'advisory-scheduler',
  SUMMARY: 'summary',
  SUCCESS: 'success',
  CONFIRM_ADDRESS: 'confirm-address',
} as const satisfies Record<string, string>;

export const ScheduleFlowStepper = defineStepper(
  { id: SCHEDULE_STEPS.INTRO },
  { id: SCHEDULE_STEPS.CREDITS_SELECT },
  { id: SCHEDULE_STEPS.CONFIRM_ADDRESS },
  { id: SCHEDULE_STEPS.PHLEBOTOMY },
  { id: SCHEDULE_STEPS.SCHEDULER },
  { id: SCHEDULE_STEPS.ADVISORY_SCHEDULER },
  { id: SCHEDULE_STEPS.SUMMARY },
  { id: SCHEDULE_STEPS.SUCCESS },
);

type ScheduleFlowStepperUseStepperType = ReturnType<
  typeof ScheduleFlowStepper.useStepper
>;

type ScheduleFlowStepId = (typeof SCHEDULE_STEPS)[keyof typeof SCHEDULE_STEPS];

type UseScheduleFlowStepperType = ScheduleFlowStepperUseStepperType & {
  validSteps: { id: ScheduleFlowStepId }[];
};

export const useScheduleFlowStepper = (): UseScheduleFlowStepperType => {
  const mode = useScheduleStore((s) => s.mode);
  const isOnOnboarding = useCheckLocation('/onboarding');

  const methods = ScheduleFlowStepper.useStepper();

  let steps: { id: ScheduleFlowStepId }[] = [
    { id: SCHEDULE_STEPS.CREDITS_SELECT },
    { id: SCHEDULE_STEPS.PHLEBOTOMY },
    { id: SCHEDULE_STEPS.SCHEDULER },
    { id: SCHEDULE_STEPS.SUMMARY },
    { id: SCHEDULE_STEPS.SUCCESS },
  ];

  if (isOnOnboarding) {
    steps.unshift({ id: SCHEDULE_STEPS.INTRO });
  }

  switch (mode) {
    case 'advisory-call':
      steps = [
        { id: SCHEDULE_STEPS.CREDITS_SELECT },
        { id: SCHEDULE_STEPS.ADVISORY_SCHEDULER },
        { id: SCHEDULE_STEPS.SUMMARY },
        { id: SCHEDULE_STEPS.SUCCESS },
      ];
      break;
    case 'test-kit':
      steps = [
        { id: SCHEDULE_STEPS.CREDITS_SELECT },
        { id: SCHEDULE_STEPS.CONFIRM_ADDRESS },
        { id: SCHEDULE_STEPS.SUMMARY },
        { id: SCHEDULE_STEPS.SUCCESS },
      ];
      break;
    case 'phlebotomy-kit':
      steps = [
        { id: SCHEDULE_STEPS.CREDITS_SELECT },
        { id: SCHEDULE_STEPS.CONFIRM_ADDRESS },
        { id: SCHEDULE_STEPS.SCHEDULER },
        { id: SCHEDULE_STEPS.SUMMARY },
        { id: SCHEDULE_STEPS.SUCCESS },
      ];
      break;
    default:
    // do nothing
  }

  const getCurrentIndex = () =>
    steps.findIndex((step) => step.id === methods.current.id);

  const next = () => {
    const idx = getCurrentIndex();
    if (idx === -1) return;

    const nextStep = steps[idx + 1];
    if (!nextStep) return;

    methods.goTo(nextStep.id);
  };

  const prev = () => {
    const idx = getCurrentIndex();
    if (idx === -1) return;

    const prevStep = steps[idx - 1];
    if (!prevStep) return;

    methods.goTo(prevStep.id);
  };

  const isLast = getCurrentIndex() === steps.length - 1;

  return {
    ...methods,
    next,
    prev,
    isLast,
    validSteps: steps,
  };
};
