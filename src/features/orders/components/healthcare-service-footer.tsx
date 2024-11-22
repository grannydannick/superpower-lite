import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Body1 } from '@/components/ui/typography';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

export const HealthcareServiceFooter = ({
  className,
  nextBtn,
  prevBtn,
}: {
  className?: string;
  prevBtn?: ReactNode | null;
  nextBtn?: ReactNode | null;
}) => {
  const { activeStep, steps, prevStep, nextStep } = useStepper((s) => s);

  const renderButton = (
    btn: ReactNode | null | undefined,
    defaultButton: ReactNode,
  ) => {
    if (btn === undefined) {
      return defaultButton;
    }
    return btn; // This includes the case when btn is null (renders nothing) or a ReactNode
  };

  return (
    <div
      className={cn(
        'flex items-center px-6 pb-12 md:justify-between md:px-14',
        className,
      )}
    >
      <Body1 className="hidden text-zinc-400 md:block">
        Step {activeStep + 1} of {steps.length}
      </Body1>
      <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
        {activeStep - 1 >= 0
          ? renderButton(
              prevBtn,
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={prevStep}
              >
                Back
              </Button>,
            )
          : null}
        {renderButton(
          nextBtn,
          activeStep + 1 < steps.length ? (
            <Button onClick={nextStep} className="w-full md:w-auto">
              Next
            </Button>
          ) : null,
        )}
      </div>
    </div>
  );
};
