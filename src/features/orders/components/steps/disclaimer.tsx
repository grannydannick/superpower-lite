import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';
import { useStepper } from '@/lib/stepper';
import { getLegalDisclaimerForService } from '@/utils/service';

export const Disclaimer = () => {
  const { activeStep, steps, nextStep } = useStepper((s) => s);
  const service = useOrder((s) => s.service);
  const [checked, setChecked] = useState<boolean>(false);

  const disclaimer = getLegalDisclaimerForService(service.name);
  return (
    <>
      <div className="space-y-8 p-6 md:space-y-12 md:p-14">
        <div className="space-y-4">
          <H2 className="text-2xl md:text-3xl">Disclaimer</H2>
          <ScrollArea className="md:max-h-[220px] md:overflow-y-scroll md:rounded-[20px] md:border md:border-zinc-200">
            <div className="md:p-6">
              <Body2 className="text-zinc-500">{disclaimer}</Body2>
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-start justify-start gap-4">
          <Checkbox
            id="legal"
            checked={checked}
            onCheckedChange={() => setChecked((prev) => !prev)}
          />
          <Label className="leading-normal text-zinc-500" htmlFor="legal">
            By continuing, I acknowledge my understanding and acceptance of the
            above information.
          </Label>
        </div>
      </div>
      <div className="flex items-center px-6 pb-12 md:justify-between md:px-14">
        <Body1 className="hidden text-zinc-400 md:block">
          Step {activeStep + 1} of {steps.length}
        </Body1>
        <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
          <Button
            onClick={nextStep}
            disabled={!checked}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};
