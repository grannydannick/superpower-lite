import { format } from 'date-fns';
import React from 'react';

import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { useMembership } from '@/features/settings/stores/membership-store';

import { CancelMembershipStepper } from '../cancel-membership-stepper';

export const GotItStep = () => {
  const { endDate } = useMembership((s) => s);
  const methods = CancelMembershipStepper.useStepper();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col items-center justify-center gap-8 text-center">
        {endDate && (
          <h1 className="text-2xl">
            You will continue to have membership benefits until{' '}
            {format(endDate, 'PP')}
          </h1>
        )}
        <p className="mt-3 text-base text-[#71717A]">
          We look forward to seeing you back as part of the Superpower community
          soon
        </p>
      </div>

      <DialogClose>
        <Button onClick={methods.navigation.reset} className="w-full">
          Got it
        </Button>
      </DialogClose>
    </div>
  );
};
