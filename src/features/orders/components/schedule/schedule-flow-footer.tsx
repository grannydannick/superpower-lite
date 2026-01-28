import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

import { useScheduleFlowStepper } from './schedule-stepper';

export const ScheduleFlowFooter = ({
  nextBtn,
  prevBtn,
  prevBtnDisabled,
  nextBtnDisabled,
}: {
  prevBtn?: ReactNode | null;
  nextBtn?: ReactNode | null;
  prevBtnDisabled?: boolean;
  nextBtnDisabled?: boolean;
}) => {
  const { isLast, next, prev, isFirst } = useScheduleFlowStepper();

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
    <div className="flex items-center py-4 backdrop-blur-sm md:py-8">
      <div className="flex w-full flex-col-reverse justify-end gap-4 md:flex-row md:gap-2">
        {renderPrevButton()}
        {renderNextButton()}
      </div>
    </div>
  );
};
