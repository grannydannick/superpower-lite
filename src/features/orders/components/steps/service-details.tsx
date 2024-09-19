import { TestDetails } from '@/components/shared/healthcare-service-info-dialog-content/types/service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { ENVIRONMENTAL_TOXIN_PANEL } from '@/const/toxin-panel';
import { useOrder } from '@/features/orders/stores/order-store';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { getHealthcareServicePriceLabel } from '@/utils/format-money';
import { getDetailsForService } from '@/utils/service';

export const HealthcareServiceDetails = () => {
  const { service, draftOrderId } = useOrder((s) => s);
  const { nextStep, prevStep, activeStep, steps } = useStepper((s) => s);
  const serviceDetails = getDetailsForService(service.name);

  const alternativeButtonPosition = Boolean(
    ENVIRONMENTAL_TOXIN_PANEL.find((p) => p.name === service.name),
  );

  return (
    <div>
      <div className="flex flex-col justify-between gap-12 px-6 py-12 md:flex-row md:px-14 md:pb-16">
        <div className="flex flex-col justify-center gap-4 md:max-w-[278px]">
          <img
            src={service.image}
            className="block size-[70px] rounded-2xl border border-zinc-200 bg-white  object-cover md:hidden"
            alt={service.name}
          />
          <div className="max-w-[220px] space-y-4 md:max-w-none">
            <H2 className="text-zinc-900">{service.name}</H2>
            <Body2 className="text-zinc-500">
              {draftOrderId
                ? 'Included'
                : getHealthcareServicePriceLabel(service)}
            </Body2>
          </div>
          <Body1 className="text-zinc-500">{service.description}</Body1>
          {!alternativeButtonPosition && (
            <Button onClick={nextStep} className="hidden md:inline-flex">
              Continue
            </Button>
          )}
        </div>

        <img
          src={service.image}
          className="hidden h-[362px] w-full rounded-2xl border border-zinc-200  bg-white object-cover md:block md:size-[362px]"
          alt={service.name}
        />
      </div>
      <Accordion
        type="single"
        collapsible
        className={cn(
          'w-full',
          serviceDetails && Object.keys(serviceDetails).length > 0
            ? 'border-t'
            : null,
        )}
      >
        {serviceDetails
          ? Object.keys(serviceDetails).map((serviceDetailTitle, index) => (
              <AccordionItem
                value={serviceDetailTitle}
                key={index}
                className="p-8 md:p-14"
              >
                <AccordionTrigger className="p-0">
                  <H4 className="text-zinc-900">{serviceDetailTitle}</H4>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-4">
                  <Body2 className="whitespace-break-spaces text-zinc-500">
                    {serviceDetails[serviceDetailTitle as keyof TestDetails]}
                  </Body2>
                </AccordionContent>
              </AccordionItem>
            ))
          : null}
      </Accordion>

      <div
        className={cn(
          'flex items-center md:justify-between px-6 md:px-14 pb-12 pt-8 md:pt-14',
          !alternativeButtonPosition ? 'md:hidden' : null,
        )}
      >
        <Body1 className="hidden text-zinc-400 md:block">
          Step {activeStep + 1} of {steps.length}
        </Body1>
        <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
          {alternativeButtonPosition ? (
            <Button
              className="w-full md:w-auto"
              variant="outline"
              onClick={prevStep}
            >
              Back
            </Button>
          ) : null}
          <Button className="w-full md:w-auto" onClick={nextStep}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
