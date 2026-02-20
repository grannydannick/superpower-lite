import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { usePurchaseStore } from '../../stores/purchase-store';

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

  const { flow, infoFlowBtn } = usePurchaseStore((s) => ({
    flow: s.flow,
    infoFlowBtn: s.infoFlowBtn,
  }));

  const renderButton = (
    btn: ReactNode | null | undefined,
    defaultButton: ReactNode,
  ) => {
    if (btn === undefined) {
      return defaultButton;
    }
    return btn; // This includes the case when btn is null (renders nothing) or a ReactNode
  };

  const renderPrevButton = () => {
    if (!isFirst)
      return renderButton(
        prevBtn,
        <Button
          variant="outline"
          className="w-full bg-white"
          onClick={prev}
          disabled={prevBtnDisabled}
        >
          Back
        </Button>,
      );

    return null;
  };

  const renderNextButton = () => {
    if (flow === 'info' && infoFlowBtn) return infoFlowBtn();

    if (nextBtn) return nextBtn;

    if (!isLast)
      return (
        <Button onClick={next} className="w-full" disabled={nextBtnDisabled}>
          Next
        </Button>
      );

    return null;
  };

  return (
    <div
      className={cn(
        // sticky footer only if parent has overflow: auto/scroll
        'bottom-0 z-50 flex items-center px-6 py-4 backdrop-blur-sm md:px-16 md:py-8 [.overflow-auto_&]:sticky [.overflow-y-scroll_&]:sticky',
        className,
      )}
    >
      <div className="flex w-full flex-col-reverse justify-end gap-4 md:flex-row md:gap-2">
        {renderPrevButton()}
        {renderNextButton()}
      </div>
    </div>
  );
};
