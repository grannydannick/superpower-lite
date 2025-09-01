import { X, Home, Truck, Phone } from 'lucide-react';
import React from 'react';

import { IconList, IconListItem } from '@/components/shared/icon-list';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Body2, H3 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

interface AtHomeTestDialogProps {
  children: React.ReactNode;
}

const STEPS: IconListItem[] = [
  {
    icon: Phone,
    title: 'Check your SMS messages',
    description:
      'We sent you a text with more details about the delivery date and time.',
  },
  {
    icon: Home,
    title: 'Do your test at home',
    description:
      'Do your test at home and follow the instructions you received in the SMS.',
  },
  {
    icon: Truck,
    title: 'Send your test back',
    description:
      "After you've completed your test, send it back to the lab partner using the prepaid labels and following the instructions provided in your test kit.",
  },
];

const DeliveryTestDialog = ({ children }: AtHomeTestDialogProps) => {
  const { width } = useWindowDimensions();

  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex flex-col overflow-hidden rounded-t-2xl">
          <SheetHeader className="pb-0">
            <SheetTitle className="ml-4">
              <H3>At-Home Test Details</H3>
            </SheetTitle>
            <SheetClose asChild className="-mt-4">
              <div className="flex h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
          </SheetHeader>
          <div className="flex h-full flex-col justify-between space-y-8 px-8 pb-12">
            <div className="space-y-8">
              <Body2 className="text-secondary">
                This test is being shipped to you for completion at home.
                You&apos;ll receive a message from your concierge team about
                what to expect.
              </Body2>
              <div className="pb-12">
                <IconList items={STEPS} />
              </div>
            </div>
            <div className="mt-12 flex justify-end">
              <SheetClose asChild>
                <Button variant="default" className="w-full text-sm">
                  Continue
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="pb-0">
          <DialogTitle>
            <H3>At-Home Test Details</H3>
          </DialogTitle>
          <DialogClose asChild className="-mt-4">
            <div className="flex h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full">
              <X className="h-4 min-w-4" />
            </div>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-8 px-14 pb-12">
          <Body2 className="text-secondary">
            This test is being shipped to you for completion at home.
            You&apos;ll receive a message from your concierge team about what to
            expect.
          </Body2>
          <div className="pb-12">
            <IconList items={STEPS} />
          </div>
          <div className="mt-12 flex justify-end">
            <DialogClose asChild>
              <Button variant="default" className="text-sm">
                Continue
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryTestDialog;
