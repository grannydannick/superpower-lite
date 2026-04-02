import { Droplets, PillBottle, TestTubeDiagonal, X } from 'lucide-react';

import { IconList } from '@/components/shared/icon-list';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Body1, H2 } from '@/components/ui/typography';

type RedrawPreparationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
};

const PREPARATION_ITEMS = [
  {
    icon: PillBottle,
    title: '72 Hours Before',
    description:
      'Stop taking supplements containing high-dose vitamin C (500 mg or higher) and biotin such as multivitamins, B-complex, or hair, skin and nail vitamins. Continue taking prescribed medication. To collect urinalysis, avoid beets, blackberries, and foods with artificial dyes.',
  },
  {
    icon: Droplets,
    title: '24 Hours Before',
    description:
      'Avoid strenuous exercise and hold off on any alcohol or heavy, fatty foods. These can influence your results. To collect urinalysis, avoid any sexual activity and using genital products.',
  },
  {
    icon: TestTubeDiagonal,
    title: '10 Hours Before',
    description:
      "Fasting is required for 10 hours prior to your appointment. Water only, no food or caffeine. Drinking one glass before your appointment is enough, do not overhydrate. To collect urinalysis, you'll need to perform a clean-catch midstream urine collection.",
  },
] as const;

export const RedrawPreparationDialog = ({
  open,
  onOpenChange,
  onContinue,
}: RedrawPreparationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[648px] gap-0 rounded-[32px] px-8 pb-8 pt-10 sm:px-10">
        <DialogTitle className="sr-only">
          Prepare for your recollection
        </DialogTitle>
        <DialogDescription className="sr-only">
          Review these preparation steps before scheduling your recollection.
        </DialogDescription>

        <div className="absolute right-6 top-6">
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-sm p-1 text-zinc-400 transition-colors hover:text-zinc-600"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
        </div>

        <div className="space-y-8">
          <div className="space-y-3 pr-10">
            <H2>Prepare for your recollection</H2>
            <Body1 className="text-secondary">
              Here are a few things to keep in mind:
            </Body1>
          </div>

          <IconList
            items={PREPARATION_ITEMS.map((item) => ({
              ...item,
              description: item.description,
            }))}
            className="pr-2"
          />

          <div className="flex justify-end">
            <Button
              type="button"
              className="h-14 min-w-[124px] rounded-[16px] text-base"
              onClick={onContinue}
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
