import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Body2, H2 } from '@/components/ui/typography';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { useStepper } from '@/lib/stepper';
import {
  getDefaultAgreementCopyForService,
  getInformedConsentForService,
} from '@/utils/service';

export const InformedConsent = () => {
  const { nextStep } = useStepper((s) => s);
  const service = useOrder((s) => s.service);
  const updateInformedConsent = useOrder((s) => s.updateInformedConsent);
  const informedConsent = useOrder((s) => s.informedConsent);

  const informedConsentText = getInformedConsentForService(service.name);
  const defaultAgreementCopy = getDefaultAgreementCopyForService(service.name);

  return (
    <>
      <div className="space-y-8 p-6 md:space-y-12 md:p-14">
        <div className="space-y-4">
          <H2 className="text-2xl md:text-3xl">Informed Consent</H2>
          <ScrollArea className="md:max-h-[220px] md:overflow-y-scroll md:rounded-[20px] md:border md:border-zinc-200">
            <div className="md:p-6">
              <Body2 className="text-zinc-500">{informedConsentText}</Body2>
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-start justify-start gap-4">
          <Checkbox
            id="legal"
            checked={informedConsent ?? false}
            onCheckedChange={updateInformedConsent}
          />
          <Label className="leading-normal text-zinc-500" htmlFor="legal">
            {defaultAgreementCopy}
          </Label>
        </div>
      </div>
      <HealthcareServiceFooter
        nextBtn={
          <Button
            onClick={nextStep}
            disabled={!informedConsent}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        }
      />
    </>
  );
};
