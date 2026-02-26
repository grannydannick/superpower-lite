import React, { useEffect } from 'react';

import { SCHEDULE_STEPS, useScheduleFlowStepper } from './schedule-stepper';
import * as Steps from './steps';

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
  }, [methods]);

  return methods.flow.switch({
    [SCHEDULE_STEPS.INTRO]: () => <Steps.IntroStep />,
    [SCHEDULE_STEPS.CREDITS_SELECT]: () => <Steps.CreditsSelectStep />,
    [SCHEDULE_STEPS.CONFIRM_ADDRESS]: () => <Steps.ConfirmAddressStep />,
    [SCHEDULE_STEPS.PHLEBOTOMY]: () => <Steps.PhlebotomyLocationSelectStep />,
    [SCHEDULE_STEPS.SCHEDULER]: () => <Steps.SchedulerStep />,
    [SCHEDULE_STEPS.ADVISORY_SCHEDULER]: () => <Steps.AdvisorySchedulerStep />,
    [SCHEDULE_STEPS.SUMMARY]: () => <Steps.ScheduleSummaryStep />,
    [SCHEDULE_STEPS.SUCCESS]: () => <Steps.ScheduleSuccessStep />,
  });
};
