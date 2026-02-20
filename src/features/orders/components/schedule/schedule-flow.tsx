import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';
import { useCheckLocation } from '@/hooks/use-check-location';

import { ScheduleStoreProvider } from '../../stores/schedule-store';
import { ScheduleStoreProps } from '../../stores/schedule-store-creator';

import { ScheduleFlowSteps } from './schedule-steps';

export const ScheduleFlow: React.FC<ScheduleStoreProps> = ({
  onSuccess,
  onDone,
  mode,
}) => {
  const navigate = useNavigate();
  const isOnOnboarding = useCheckLocation('/onboarding');

  return (
    <ScheduleStoreProvider onSuccess={onSuccess} onDone={onDone} mode={mode}>
      <div className="fixed left-0 top-0 z-20 hidden w-full px-10 py-2 md:flex md:h-14 md:items-center">
        <SuperpowerLogo className="h-4 w-[122px]" />
      </div>
      <div className="mx-auto flex w-full max-w-[656px] flex-1 flex-col space-y-8 px-6 py-8 md:my-auto md:flex-none md:px-16">
        {!isOnOnboarding && (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="size-[18px] text-zinc-400" />
              <Body2 className="text-secondary">Back</Body2>
            </Button>
            <SuperpowerLogo className="md:hidden" />
          </div>
        )}
        {isOnOnboarding && (
          <div className="flex items-center justify-end md:hidden">
            <SuperpowerLogo />
          </div>
        )}
        <ScheduleFlowSteps />
      </div>
    </ScheduleStoreProvider>
  );
};
