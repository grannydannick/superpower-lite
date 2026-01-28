import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div className="mx-auto flex w-full max-w-[656px] flex-1 flex-col space-y-8 px-6 py-8 md:px-16">
        <div className="flex items-center justify-between gap-2">
          {isOnOnboarding ? (
            <div />
          ) : (
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="size-[18px] text-zinc-400" />
              <Body2 className="text-secondary">Back</Body2>
            </Button>
          )}
          <SuperpowerLogo />
        </div>
        <ScheduleFlowSteps />
      </div>
    </ScheduleStoreProvider>
  );
};
