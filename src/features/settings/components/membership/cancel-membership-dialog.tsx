import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CancelMembership } from '@/features/settings/components/membership/cancel-membership';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { Subscription } from '@/types/api';

interface CancelMembershipDialogProps {
  children: React.ReactNode;
  membership?: Subscription;
}

export const CancelMembershipDialog = ({
  children,
  membership,
}: CancelMembershipDialogProps) => {
  const { width } = useWindowDimensions();

  if (!membership) return null;

  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px] p-0">
          <SheetTitle className="sr-only">Cancel membership</SheetTitle>
          <SheetDescription className="sr-only">
            Review the impacts of cancelling, then confirm cancellation.
          </SheetDescription>
          <CancelMembership subscription={membership} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="mx-auto w-fit max-w-max p-0">
        <DialogTitle className="sr-only">Cancel membership</DialogTitle>
        <DialogDescription className="sr-only">
          Review the impacts of cancelling, then confirm cancellation.
        </DialogDescription>
        <CancelMembership subscription={membership} />
      </DialogContent>
    </Dialog>
  );
};
