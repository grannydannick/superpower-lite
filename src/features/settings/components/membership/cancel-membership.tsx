import { ChevronLeft, X } from 'lucide-react';

import { DialogClose, DialogContent } from '@/components/ui/dialog';
import { useStepper } from '@/components/ui/stepper';
import { MembershipStoreProvider } from '@/features/settings/stores/membership-store';
import { cn } from '@/lib/utils';
import { Subscription } from '@/types/api';

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
  const { steps, activeStep, resetSteps } = useStepper((s) => s);

  return (
    <DialogContent
      className={cn(
        `z-[110] overflow-y-scroll px-6 md:px-14 py-12 flex flex-col justify-between gap-12`,
        activeStep === steps.length - 1 ? 'max-w-[432px]' : 'rounded-[24px]',
      )}
    >
      <div
        className={cn(
          `flex items-center justify-between pb-6`,
          activeStep === steps.length - 1 && 'hidden',
        )}
      >
        <div
          className="block cursor-pointer rounded-full bg-zinc-100 p-3 md:hidden"
          // onClick={handleClose}
        >
          <ChevronLeft className="size-6 p-1" />
        </div>
        <span className="text-[#71717A]">Pause membership</span>
        <DialogClose>
          <X
            className="hidden size-4 cursor-pointer md:block"
            onClick={resetSteps}
          />
        </DialogClose>
        <div className="block size-6 p-3 md:hidden" />
      </div>
      {steps[activeStep].content ?? null}
    </DialogContent>
  );
}
