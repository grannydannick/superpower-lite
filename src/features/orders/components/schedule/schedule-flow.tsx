import React from 'react';

import { ScheduleStoreProvider } from '../../stores/schedule-store';
import { ScheduleStoreProps } from '../../stores/schedule-store-creator';

import { ScheduleFlowSteps } from './schedule-steps';

export const ScheduleFlow: React.FC<ScheduleStoreProps> = ({
  onSuccess,
  onDone,
  mode,
}) => {
  return (
    <ScheduleStoreProvider onSuccess={onSuccess} onDone={onDone} mode={mode}>
      <div className="mx-auto w-full max-w-3xl py-8">
        <ScheduleFlowSteps />
      </div>
    </ScheduleStoreProvider>
  );
};
