import React from 'react';

import { SCHEDULE_STEPS, ScheduleFlowStepper } from './schedule-stepper';
import * as Steps from './steps';

export const ScheduleFlowSteps = () => {
  return (
    <ScheduleFlowStepper.Scoped>
      <ScheduleFlowStepsContent />
    </ScheduleFlowStepper.Scoped>
  );
};

const ScheduleFlowStepsContent = (): React.ReactElement => {
  const methods = ScheduleFlowStepper.useStepper();

  return (
    <React.Fragment>
      {methods.switch({
        [SCHEDULE_STEPS.CREDITS_SELECT]: () => <Steps.CreditsSelectStep />,
        [SCHEDULE_STEPS.RECOMMENDATIONS]: () => (
          <Steps.BloodDrawRecommendationsStep />
        ),
        [SCHEDULE_STEPS.CONFIRM_ADDRESS]: () => <Steps.ConfirmAddressStep />,
        [SCHEDULE_STEPS.PHLEBOTOMY]: () => (
          <Steps.PhlebotomyLocationSelectStep />
        ),
        [SCHEDULE_STEPS.SCHEDULER]: () => <Steps.SchedulerStep />,
        [SCHEDULE_STEPS.ADVISORY_SCHEDULER]: () => (
          <Steps.AdvisorySchedulerStep />
        ),
        [SCHEDULE_STEPS.SUMMARY]: () => <Steps.ScheduleSummaryStep />,
        [SCHEDULE_STEPS.SUCCESS]: () => <Steps.ScheduleSuccessStep />,
      })}
    </React.Fragment>
  );
};
