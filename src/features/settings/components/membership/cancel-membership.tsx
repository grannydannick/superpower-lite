import { X } from 'lucide-react';
import React from 'react';

import { DialogClose } from '@/components/ui/dialog';
import { MembershipStoreProvider } from '@/features/settings/stores/membership-store';
import { cn } from '@/lib/utils';
import { Subscription } from '@/types/api';

import { CancelMembershipStepper } from './cancel-membership-stepper';
import { CancelMembershipSteps } from './cancel-membership-steps';

interface CancelMembershipProps {
  subscription: Subscription;
}

export function CancelMembership({ subscription }: CancelMembershipProps) {
  return (
    <MembershipStoreProvider subscription={subscription}>
      <CancelMembershipCard />
    </MembershipStoreProvider>
  );
}

function CancelMembershipCard() {
  return (
    <CancelMembershipStepper.Scoped>
      <CancelMembershipCardContent />
    </CancelMembershipStepper.Scoped>
  );
}

function CancelMembershipCardContent() {
  const methods = CancelMembershipStepper.useStepper();
  const activeStep = methods.state.current.index;
  const totalSteps = methods.state.all.length;

  return (
    <div
      className={cn(
        `z-[110] flex flex-col justify-between gap-12 overflow-y-scroll px-6 py-12 md:px-14`,
        activeStep === totalSteps - 1 ? 'max-w-[432px]' : 'rounded-[24px]',
      )}
    >
      <div
        className={cn(
          `flex items-center justify-between pb-6`,
          activeStep === totalSteps - 1 && 'hidden',
        )}
      >
        <DialogClose>
          <div
            onClick={methods.navigation.reset}
            role="presentation"
            className="block cursor-pointer rounded-full bg-zinc-100 p-3 md:hidden"
          >
            <X className="h-6 min-w-6 p-1" />
          </div>
        </DialogClose>
        <span className="text-[#71717A]">Pause membership</span>
        <DialogClose>
          <X
            className="hidden size-4 cursor-pointer md:block"
            onClick={methods.navigation.reset}
          />
        </DialogClose>
        <div className="block size-6 p-3 md:hidden" />
      </div>
      <CancelMembershipSteps />
    </div>
  );
}
