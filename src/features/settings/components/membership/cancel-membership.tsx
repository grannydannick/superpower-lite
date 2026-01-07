import { X } from 'lucide-react';

import { DialogClose } from '@/components/ui/dialog';
import { MembershipStoreProvider } from '@/features/settings/stores/membership-store';
import { cn } from '@/lib/utils';
import { Subscription } from '@/types/api';

import { CancelMembershipStepper } from './cancel-membership-stepper';
import { CancelMembershipSteps } from './cancel-membership-steps';

interface CancelMembershipProps {
  subscription: Subscription;
}

export function CancelMembership({
  subscription,
}: CancelMembershipProps): JSX.Element {
  return (
    <MembershipStoreProvider subscription={subscription}>
      <CancelMembershipCard />
    </MembershipStoreProvider>
  );
}

function CancelMembershipCard(): JSX.Element {
  const methods = CancelMembershipStepper.useStepper();
  const utils = CancelMembershipStepper.utils;

  const activeStep = utils.getIndex(methods.current.id);

  return (
    <div
      className={cn(
        `z-[110] overflow-y-scroll px-6 md:px-14 py-12 flex flex-col justify-between gap-12`,
        activeStep === methods.all.length - 1
          ? 'max-w-[432px]'
          : 'rounded-[24px]',
      )}
    >
      <div
        className={cn(
          `flex items-center justify-between pb-6`,
          activeStep === methods.all.length - 1 && 'hidden',
        )}
      >
        <DialogClose>
          <div
            onClick={methods.reset}
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
            onClick={methods.reset}
          />
        </DialogClose>
        <div className="block size-6 p-3 md:hidden" />
      </div>
      <CancelMembershipSteps />
    </div>
  );
}
