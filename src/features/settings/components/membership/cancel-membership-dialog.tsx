import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CancelMembership } from '@/features/settings/components/membership/cancel-membership';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { Subscription } from '@/types/api';

import { CancelMembershipStepper } from './cancel-membership-stepper';

interface CancelMembershipDialogProps {
  children: JSX.Element;
  membership?: Subscription;
}

export const CancelMembershipDialog = ({
  children,
  membership,
}: CancelMembershipDialogProps) => {
  const methods = CancelMembershipStepper.useStepper();
  const { width } = useWindowDimensions();

  if (!membership) return null;

  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px] p-0">
          <CancelMembership subscription={membership} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={methods.reset}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="mx-auto w-fit max-w-max p-0">
        <CancelMembership subscription={membership} />
      </DialogContent>
    </Dialog>
  );
};
