import { lazy, Suspense, useEffect } from 'react';

import { SCHEDULE_STEPS, useScheduleFlowStepper } from './schedule-stepper';
import { AdvisorySchedulerStep } from './steps/advisory-scheduler';
import { ConfirmAddressStep } from './steps/confirm-address';
import { CreditsSelectStep } from './steps/credits-select';
import { IntroStep } from './steps/intro';
import { PhlebotomyLocationSelectStep } from './steps/phlebotomy-location';
import { ScheduleSuccessStep } from './steps/schedule-success';
import { ScheduleSummaryStep } from './steps/schedule-summary';
import { SchedulerStep } from './steps/scheduler';

const ScheduleMarketplaceStep = lazy(async () => {
  const module = await import('./steps/schedule-marketplace');
  return { default: module.ScheduleMarketplaceStep };
});

export const ScheduleFlowSteps = () => {
  return (
    <div className="flex flex-1 flex-col">
      <ScheduleFlowStepsContent />
    </div>
  );
};

const ScheduleFlowStepsContent = () => {
  const methods = useScheduleFlowStepper();

  useEffect(() => {
    const isCurrentStepValid = methods.validSteps.some(
      (step) => step.id === methods.state.current.data.id,
    );
    if (!isCurrentStepValid && methods.validSteps.length > 0) {
      void methods.navigation.goTo(methods.validSteps[0].id);
    }
  }, [methods.navigation, methods.state.current.data.id, methods.validSteps]);

  return methods.flow.switch({
    [SCHEDULE_STEPS.INTRO]: () => <IntroStep />,
    [SCHEDULE_STEPS.MARKETPLACE]: () => (
      <Suspense fallback={null}>
        <ScheduleMarketplaceStep />
      </Suspense>
    ),
    [SCHEDULE_STEPS.CREDITS_SELECT]: () => <CreditsSelectStep />,
    [SCHEDULE_STEPS.CONFIRM_ADDRESS]: () => <ConfirmAddressStep />,
    [SCHEDULE_STEPS.PHLEBOTOMY]: () => <PhlebotomyLocationSelectStep />,
    [SCHEDULE_STEPS.SCHEDULER]: () => <SchedulerStep />,
    [SCHEDULE_STEPS.ADVISORY_SCHEDULER]: () => <AdvisorySchedulerStep />,
    [SCHEDULE_STEPS.SUMMARY]: () => <ScheduleSummaryStep />,
    [SCHEDULE_STEPS.SUCCESS]: () => <ScheduleSuccessStep />,
  });
};
