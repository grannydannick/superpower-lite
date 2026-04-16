import { defineStepper } from '@stepperize/react';
import { useMatchRoute } from '@tanstack/react-router';

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

interface ScheduleFlowStep {
  id: ScheduleFlowStepId;
}

interface UseScheduleFlowStepperType extends ScheduleFlowStepperUseStepperType {
  validSteps: ScheduleFlowStep[];
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  prev: () => void;
}

export const useScheduleFlowStepper = (): UseScheduleFlowStepperType => {
  const mode = useScheduleStore((s) => s.mode);
  const matchRoute = useMatchRoute();
  const isOnOnboarding =
    matchRoute({ to: '/onboarding', fuzzy: true }) !== false;

  const methods = ScheduleFlowStepper.useStepper();

  let steps: ScheduleFlowStep[] = [
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
    default:
    // do nothing
  }

  const getCurrentIndex = () =>
    steps.findIndex((step) => step.id === methods.state.current.data.id);

  const next = () => {
    const idx = getCurrentIndex();
    if (idx === -1) return;

    const nextStep = steps[idx + 1];
    if (!nextStep) return;

    void methods.navigation.goTo(nextStep.id);
  };

  const prev = () => {
    const idx = getCurrentIndex();
    if (idx === -1) return;

    const prevStep = steps[idx - 1];
    if (!prevStep) return;

    void methods.navigation.goTo(prevStep.id);
  };

  const currentIndex = getCurrentIndex();
  const isLast = currentIndex === steps.length - 1;
  const isFirst = currentIndex <= 0;

  return {
    ...methods,
    currentIndex,
    next,
    prev,
    isFirst,
    isLast,
    validSteps: steps,
  };
};
