import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { usePurchaseDialogStepper } from './purchase-dialog-stepper';

export const PurchaseDialogFooter = ({
  className,
  nextBtn,
  prevBtn,
  prevBtnDisabled,
  nextBtnDisabled,
}: {
  className?: string;
  prevBtn?: ReactNode | null;
  nextBtn?: ReactNode | null;
  prevBtnDisabled?: boolean;
  nextBtnDisabled?: boolean;
}) => {
  const { isLast, next, prev, isFirst } = usePurchaseDialogStepper();

  let prevButton: ReactNode | null = null;
  if (!isFirst) {
    if (prevBtn === undefined) {
      prevButton = (
        <Button
          variant="outline"
          className="w-full bg-white"
          onClick={prev}
          disabled={prevBtnDisabled}
        >
          Back
        </Button>
      );
    } else {
      prevButton = prevBtn;
    }
  }

  let nextButton: ReactNode | null = null;
  if (nextBtn) {
    nextButton = nextBtn;
  } else if (!isLast) {
    nextButton = (
      <Button onClick={next} className="w-full" disabled={nextBtnDisabled}>
        Next
      </Button>
    );
  }

  return (
    <div
      className={cn(
        // sticky footer only if parent has overflow: auto/scroll
        'bottom-0 z-50 flex items-center px-6 py-4 backdrop-blur-sm md:px-16 md:py-8 [.overflow-auto_&]:sticky [.overflow-y-scroll_&]:sticky',
        className,
      )}
    >
      <div className="flex w-full flex-col-reverse justify-end gap-4 md:flex-row md:gap-2">
        {prevButton}
        {nextButton}
      </div>
    </div>
  );
};
