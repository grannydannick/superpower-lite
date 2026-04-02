import { X } from 'lucide-react';
import { useState } from 'react';

import { IconList } from '@/components/shared/icon-list';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { Body1, H3 } from '@/components/ui/typography';
import {
  URINE_SAMPLE_FEMALE_NOTES,
  URINE_SAMPLE_STEPS,
} from '@/features/orders/const/urine-sample-steps';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';

export const UrineSampleRecommendations = () => {
  const [open, setOpen] = useState(true);

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
          <SheetTitle className="sr-only">
            Preparing your urine sample
          </SheetTitle>
          <SheetDescription className="sr-only">
            You will also provide a urine sample during the same visit.
          </SheetDescription>
          <UrineSampleRecommendationsContent />
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
        <DialogTitle className="sr-only">
          Preparing your urine sample
        </DialogTitle>
        <DialogDescription className="sr-only">
          You will also provide a urine sample during the same visit.
        </DialogDescription>
        <div className="fixed right-10 top-8">
          <DialogClose>
            <X className="size-6 cursor-pointer p-1" />
          </DialogClose>
        </div>
        <UrineSampleRecommendationsContent />
      </DialogContent>
    </Dialog>
  );
};

const UrineSampleRecommendationsContent = () => {
  const { data: user } = useUser();

  return (
    <>
      <div className="space-y-3">
        <H3>Preparing your urine sample</H3>
        <div className="space-y-3">
          <Body1 className="text-secondary">
            You will also provide a urine sample during the same visit. Here are
            a few additional things to keep in mind:
          </Body1>
          <IconList
            items={URINE_SAMPLE_STEPS}
            className="[&>:last-child_div]:mb-0"
          />
          {user?.gender?.toLowerCase() === 'female' && (
            <div className="space-y-3">
              {URINE_SAMPLE_FEMALE_NOTES.map((note) => (
                <p key={note} className="text-sm text-secondary">
                  {note}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end pt-6">
        <DialogClose asChild>
          <Button type="button">Continue</Button>
        </DialogClose>
      </div>
    </>
  );
};
