import { Check, X } from 'lucide-react';

import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import { Button } from '../ui/button';
import { Body2, H2 } from '../ui/typography';

const HealthScoreDialogContent = () => {
  return (
    <div className="p-10">
      <div className="flex w-full flex-col-reverse justify-between text-center md:flex-row md:text-left">
        <div className="w-full space-y-3 py-3 md:w-1/2 md:py-10">
          <H2 className="mx-auto w-3/4 md:w-full">
            Introducing the Superpower Score
          </H2>
          <div className="space-y-1.5">
            <div className="flex flex-row space-x-2">
              <Check className="size-2 text-vermillion-900" />
              <Body2 className="text-secondary">
                The most comprehensive health score
              </Body2>
            </div>
            <div className="flex flex-row space-x-2">
              <Check className="size-2 text-vermillion-900" />
              <Body2 className="text-secondary">
                Measured across 21 key areas of health
              </Body2>
            </div>
            <div className="flex flex-row space-x-2">
              <Check className="size-2 text-vermillion-900" />
              <Body2 className="text-secondary">
                Combined with your biological age
              </Body2>
            </div>
          </div>
        </div>
        <div className="w-full px-14 py-6 md:w-1/2">
          <img
            src="/public/cards/health-score-card.png"
            alt="Health Score card"
          />
        </div>
      </div>
      <div className="space-y-5">
        <Body2 className="rounded-lg bg-zinc-100 p-4 text-secondary">
          Share your score to X/Twitter and tag{' '}
          <a
            href="https://x.com/superpower"
            target="_blank"
            rel="noreferrer"
            className="text-vermillion-900"
          >
            @superpower
          </a>{' '}
          for the chance to win a free gut microbiome and toxin test valued at
          $499. Giveaway ends Dec 10.
        </Body2>
        <Button className="w-full">Learn more</Button>
      </div>
    </div>
  );
};

export const HealthScoreDialog = () => {
  const { width } = useWindowDimensions();

  if (width <= 768) {
    return (
      <Sheet defaultOpen={true}>
        {/* <SheetTrigger asChild>{children}</SheetTrigger> */}
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <HealthScoreDialogContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog defaultOpen={true}>
      {/* <DialogTrigger asChild>{children}</DialogTrigger> */}
      <DialogContent className="max-w-[740px]">
        <div className="fixed right-10 top-8">
          <DialogClose>
            <X className="size-6 cursor-pointer p-1" />
          </DialogClose>
        </div>
        <HealthScoreDialogContent />
      </DialogContent>
    </Dialog>
  );
};
