import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStepper } from '@/components/ui/stepper';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';
import { getLegalDisclaimerForService } from '@/features/orders/utils/get-legal-disclaimer-for-service';

export const Disclaimer = () => {
  const { activeStep, steps, nextStep } = useStepper((s) => s);
  const service = useOrder((s) => s.service);

  const disclaimer = getLegalDisclaimerForService(service);
  return (
    <>
      <div className="space-y-8 md:space-y-12">
        <div className="space-y-4">
          <H2 className="text-2xl md:text-3xl">Disclaimer</H2>
          <ScrollArea className="md:max-h-[220px] md:overflow-y-scroll md:rounded-[20px] md:border md:border-zinc-200">
            <div className="md:p-6">
              <Body2 className="text-zinc-500">{disclaimer}</Body2>
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-start justify-start gap-4">
          <Checkbox />
          <Body2 className="leading-normal text-zinc-500">
            By continuing, I acknowledge my understanding and acceptance of the
            above information.
          </Body2>
        </div>
      </div>
      {/*Mobile button*/}
      <div className="py-3 pb-[38px] pt-8 md:hidden">
        <Button className="w-full" onClick={nextStep}>
          Next
        </Button>
      </div>

      {/*Desktop button*/}
      <div className="mt-12 hidden items-center justify-between md:flex">
        <Body1 className="text-zinc-500">
          Step {activeStep + 1} of {steps.length}
        </Body1>
        <Button onClick={nextStep}>Next</Button>
      </div>
    </>
  );
};
