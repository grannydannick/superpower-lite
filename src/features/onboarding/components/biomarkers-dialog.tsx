import { X } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
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
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, H3, H4 } from '@/components/ui/typography';
import { BIOMARKER_CATEGORIES } from '@/features/onboarding/const/biomarkers-content';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { formatMoney } from '@/utils/format-money';

interface BiomarkersFaqDialogProps {
  children: React.ReactNode;
  onUpgradeOrder: () => Promise<void>;
  isLoading: boolean;
  price: number;
}
const BiomarkersFaqDialog = ({
  children,
  onUpgradeOrder,
  isLoading,
  price,
}: BiomarkersFaqDialogProps) => {
  const { width } = useWindowDimensions();

  const renderContent = () => (
    <>
      <div className="space-y-14">
        {BIOMARKER_CATEGORIES.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={category.image}
                alt={category.title}
                className="pointer-events-none size-12 rounded-xl object-cover"
              />

              <H4 className="font-semibold text-foreground">
                {category.title}
              </H4>
            </div>

            {category.biomarkers.length > 0 && (
              <ul className="columns-1 gap-x-6 space-y-4 sm:columns-2">
                {category.biomarkers.map((biomarker, biomarkerIndex) => (
                  <li
                    key={biomarkerIndex}
                    className="flex break-inside-avoid items-center space-x-3"
                  >
                    <Body1 className="font-medium text-zinc-500">
                      {biomarker.title}
                    </Body1>
                    {biomarker.advanced && (
                      <Badge variant="vermillion" className="whitespace-nowrap">
                        Advanced Panel
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <DialogClose asChild>
          <Button
            variant="outline"
            className="w-full text-sm sm:w-auto"
            disabled={isLoading}
          >
            No thanks
          </Button>
        </DialogClose>
        <Button
          className="w-full text-sm sm:w-auto"
          disabled={isLoading}
          onClick={onUpgradeOrder}
        >
          {isLoading ? (
            <TransactionSpinner className="flex justify-center" />
          ) : (
            <>Upgrade to Advanced (+{formatMoney(price)})</>
          )}
        </Button>
      </div>
    </>
  );

  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex flex-col gap-6 overflow-hidden rounded-t-2xl">
          <SheetHeader className="pb-0">
            <SheetTitle className="ml-4">
              <H3>Superpower Biomarkers</H3>
            </SheetTitle>
            <SheetClose asChild className="-mt-4">
              <div className="flex h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-8 pb-12">
            {renderContent()}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-4xl gap-6 overflow-y-auto">
        <DialogHeader className="pb-0">
          <DialogTitle>
            <H3>Superpower Biomarkers</H3>
          </DialogTitle>
          <DialogClose asChild className="-mt-4">
            <div className="flex h-[42px] min-w-[42px] cursor-pointer items-center justify-center rounded-full">
              <X className="h-4 min-w-4" />
            </div>
          </DialogClose>
        </DialogHeader>
        <div className="px-14 pb-12">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
};

export default BiomarkersFaqDialog;
