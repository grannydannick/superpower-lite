import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useOrder } from '@/features/orders/stores/order-store';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

export const HealthcareServiceFooter = ({
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
  const { activeStep, steps, prevStep, nextStep } = useStepper((s) => s);
  const { flow, infoFlowBtn } = useOrder((s) => ({
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
    if (activeStep - 1 >= 0)
      return renderButton(
        prevBtn,
        <Button
          variant="outline"
          className="w-full bg-white"
          onClick={prevStep}
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

    if (activeStep + 1 < steps.length)
      return (
        <Button
          onClick={nextStep}
          className="w-full"
          disabled={nextBtnDisabled}
        >
          Next
        </Button>
      );

    return null;
  };

  return (
    <div
      className={cn(
        // sticky footer only if parent has overflow: auto/scroll (e.g. dialog)
        'bottom-0 z-50 backdrop-blur-sm flex items-center px-6 py-4 md:py-8 md:px-16 [.overflow-auto_&]:sticky [.overflow-y-scroll_&]:sticky',
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
