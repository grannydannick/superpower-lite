import { X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

import { IconList } from '@/components/shared/icon-list';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Body1, H2, H4 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';
import { PhlebotomyLocation } from '@/types/api';

import { WALK_IN_TEST_STEPS } from '../../../../features/orders/const/test-steps';

const DAYS = [
  ['Mon', 'Monday'],
  ['Tue', 'Tuesday'],
  ['Wed', 'Wednesday'],
  ['Thu', 'Thursday'],
  ['Fri', 'Friday'],
  ['Sat', 'Saturday'],
  ['Sun', 'Sunday'],
] as const;

export const WalkInNotice = ({
  location,
  open,
  setOpen,
}: {
  location: PhlebotomyLocation;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { width } = useWindowDimensions();

  if (width <= 1024) {
    return (
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
        }}
      >
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px] p-6">
          <WalkInNoticeContent location={location} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <DialogContent className="w-full max-w-[592px] gap-0 p-10">
        <div className="fixed right-10 top-8">
          <DialogClose>
            <X className="size-6 cursor-pointer p-1" />
          </DialogClose>
        </div>
        <WalkInNoticeContent location={location} />
      </DialogContent>
    </Dialog>
  );
};

const WalkInNoticeContent = ({
  location,
}: {
  location: PhlebotomyLocation;
}) => {
  return (
    <>
      <div className={cn('space-y-8')}>
        <div className="space-y-2">
          <H2>Visit during opening hours</H2>
          <Body1 className="text-zinc-500">
            No booking is required for your selected lab. You can walk in
            anytime during their opening hours. The visit takes about 15
            minutes. For best results, come within 2 hours after waking up
          </Body1>
        </div>
        <IconList items={WALK_IN_TEST_STEPS} />
        <div className="w-full space-y-4">
          <H4>Opening hours</H4>
          <div className="rounded-2xl border bg-white p-2 shadow-[0.2]">
            {DAYS.map(([key, label]) => {
              const hours = location?.hours?.[key] ?? 'Closed';

              return (
                <div
                  key={key}
                  className="flex flex-col justify-between gap-1.5 border-b px-2 py-4 last:border-0 sm:flex-row sm:items-center"
                >
                  <Body1>{label}</Body1>
                  <Body1 className={'text-secondary'}>{hours}</Body1>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-6">
        <DialogClose>
          <Button>Continue</Button>
        </DialogClose>
      </div>
    </>
  );
};
