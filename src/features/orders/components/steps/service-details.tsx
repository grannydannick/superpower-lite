import { TestDetails } from '@/components/shared/healthcare-service-info-dialog-content/types/service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useStepper } from '@/components/ui/stepper';
import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { ENVIRONMENTAL_TOXIN_PANEL } from '@/const/toxin-panel';
import { useOrder } from '@/features/orders/stores/order-store';
import { cn } from '@/lib/utils';
import { getHealthcareServicePriceLabel } from '@/utils/format-money';
import { getDetailsForService } from '@/utils/service';

export const HealthcareServiceDetails = () => {
  const { service } = useOrder((s) => s);
  const { activeStep, nextStep, steps, prevStep } = useStepper((s) => s);
  const serviceDetails = getDetailsForService(service.name);

  const buttonsBottom = Boolean(
    ENVIRONMENTAL_TOXIN_PANEL.find((p) => p.name === service.name),
  );

  return (
    <div>
      <div className="flex flex-col justify-between gap-12 pb-16 md:flex-row">
        <div className="flex flex-col justify-center gap-6 md:max-w-[278px]">
          <div>
            <H2 className="text-zinc-900">{service.name}</H2>
            <Body2 className="text-zinc-500">
              {getHealthcareServicePriceLabel(service)}
            </Body2>
          </div>
          <Body1 className="text-zinc-500">{service.description}</Body1>
          {!buttonsBottom && <Button onClick={nextStep}>Continue</Button>}
        </div>

        <img
          src={service.image}
          className="h-[362px] w-full rounded-2xl border border-zinc-200 bg-white  object-cover md:size-[362px]"
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
                className="py-12"
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
      {buttonsBottom && (
        <div className="flex items-center justify-between pt-12">
          <Body1 className="text-zinc-400">
            Step {activeStep + 1} of {steps.length}
          </Body1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};
