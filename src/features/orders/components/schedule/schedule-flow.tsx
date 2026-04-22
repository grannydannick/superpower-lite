import { useMatchRoute } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import React from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';

import { ScheduleStoreProvider } from '../../stores/schedule-store';
import { ScheduleStoreProps } from '../../stores/schedule-store-creator';

import {
  ScheduleFlowStepper,
  useScheduleFlowStepper,
} from './schedule-stepper';
import { ScheduleFlowSteps } from './schedule-steps';

export const ScheduleFlow: React.FC<ScheduleStoreProps> = ({
  onSuccess,
  onDone,
  mode,
  showAddons,
}) => {
  const matchRoute = useMatchRoute();
  const isOnOnboarding =
    matchRoute({ to: '/onboarding', fuzzy: true }) !== false;

  return (
    <ScheduleStoreProvider
      onSuccess={onSuccess}
      onDone={onDone}
      mode={mode}
      showAddons={showAddons}
    >
      <ScheduleFlowStepper.Scoped>
        <ScheduleFlowContent isOnOnboarding={isOnOnboarding} />
      </ScheduleFlowStepper.Scoped>
    </ScheduleStoreProvider>
  );
};

interface ScheduleFlowContentProps {
  isOnOnboarding: boolean;
}

const ScheduleFlowContent = ({ isOnOnboarding }: ScheduleFlowContentProps) => {
  const { isFirst, prev } = useScheduleFlowStepper();

  return (
    <>
      <div className="fixed left-0 top-0 z-20 hidden w-full px-10 py-2 md:flex md:h-14 md:items-center">
        <SuperpowerLogo className="h-4 w-[122px]" />
      </div>
      <div className="mx-auto flex w-full max-w-[656px] flex-1 flex-col space-y-8 px-6 py-8 md:my-auto md:flex-none md:px-16">
        {!isOnOnboarding ? (
          <div className="relative z-[50] flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              className="relative flex items-center gap-2 p-0"
              onClick={() => {
                if (!isFirst) {
                  prev();
                  return;
                }

                window.history.back();
              }}
            >
              <ChevronLeft className="size-[18px] text-zinc-400" />
              <Body2 className="text-secondary">Back</Body2>
            </Button>
            <SuperpowerLogo className="md:hidden" />
          </div>
        ) : (
          <div className="flex items-center justify-end md:hidden">
            <SuperpowerLogo />
          </div>
        )}
        <ScheduleFlowSteps />
      </div>
    </>
  );
};
