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
import { FEMALE_RECOMMENDATIONS } from '@/features/orders/const/female-recommendations';
import { TEST_STEPS } from '@/features/orders/const/test-steps';
import { getNextRecommendedDay } from '@/features/orders/utils/get-next-recommended-day';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';

interface BloodDrawRecommendationsProps {
  onClose?: () => void;
}

export const BloodDrawRecommendations = ({
  onClose,
}: BloodDrawRecommendationsProps) => {
  const [open, setOpen] = useState(true);
  const recommendedDay = getNextRecommendedDay();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      onClose?.();
    }
  };

  const { width } = useWindowDimensions();
  if (width <= 1024) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px] p-6">
          <SheetTitle className="sr-only">
            Recommendations for testing
          </SheetTitle>
          <SheetDescription className="sr-only">
            Book your test on or after {recommendedDay} for the most accurate
            results.
          </SheetDescription>
          <BloodDrawRecommendationsContent recommendedDay={recommendedDay} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-[592px] gap-0 p-10">
        <DialogTitle className="sr-only">
          Recommendations for testing
        </DialogTitle>
        <DialogDescription className="sr-only">
          Book your test on or after {recommendedDay} for the most accurate
          results.
        </DialogDescription>
        <div className="fixed right-10 top-8">
          <DialogClose>
            <X className="size-6 cursor-pointer p-1" />
          </DialogClose>
        </div>
        <BloodDrawRecommendationsContent recommendedDay={recommendedDay} />
      </DialogContent>
    </Dialog>
  );
};

const BloodDrawRecommendationsContent = ({
  recommendedDay,
}: {
  recommendedDay: string;
}) => {
  const { data: user } = useUser();
  return (
    <>
      <div className="space-y-4">
        <H3>Recommendations for testing</H3>
        <div className="space-y-8">
          <Body1 className="text-secondary">
            Book your test on or after {recommendedDay} for the most accurate
            results.
          </Body1>
          {user?.gender?.toLowerCase() === 'female' && (
            <ul className="list-outside list-disc space-y-3 pl-5 marker:text-zinc-300 md:mb-0 md:mt-4">
              {FEMALE_RECOMMENDATIONS.map((recommendation) => (
                <li key={recommendation}>
                  <Body1 className="text-secondary">{recommendation}</Body1>
                </li>
              ))}
            </ul>
          )}
          <IconList items={TEST_STEPS} />
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
