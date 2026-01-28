import { X } from 'lucide-react';
import { useState } from 'react';

import { IconList } from '@/components/shared/icon-list';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Body1, H3 } from '@/components/ui/typography';
import { FEMALE_RECOMMENDATIONS } from '@/features/orders/const/female-recommendations';
import { TEST_STEPS } from '@/features/orders/const/test-steps';
import { getNextRecommendedDay } from '@/features/orders/utils/get-next-recommended-day';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';

export const BloodDrawRecommendations = () => {
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
          <BloodDrawRecommendationsContent />
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
        <BloodDrawRecommendationsContent />
      </DialogContent>
    </Dialog>
  );
};

const BloodDrawRecommendationsContent = () => {
  const { data: user } = useUser();
  return (
    <>
      <div className="space-y-4">
        <H3>Recommendations for testing</H3>
        <div className="space-y-8">
          <Body1 className="text-secondary">
            Book your test on or after {getNextRecommendedDay()} for the most
            accurate results.
          </Body1>
          {user?.gender?.toLowerCase() === 'female' && (
            <ul className="list-outside list-disc space-y-3 pl-5 marker:text-zinc-300 md:mb-0 md:mt-4">
              {FEMALE_RECOMMENDATIONS.map((recommendation, index) => (
                <li key={index}>
                  <Body1 className="text-secondary">{recommendation}</Body1>
                </li>
              ))}
            </ul>
          )}
          <IconList items={TEST_STEPS} />
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
