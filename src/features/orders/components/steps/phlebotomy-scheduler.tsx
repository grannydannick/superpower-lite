import { Button } from '@/components/ui/button';
import { Scheduler } from '@/components/ui/scheduler';
import { useStepper } from '@/components/ui/stepper';
import { Body1 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { Address, Slot } from '@/types/api';

export const PhlebotomyScheduler = () => {
  const { service, location, collectionMethod, updateSlot, setTz, slot } =
    useOrder((s) => s);
  const { width } = useWindowDimensions();
  const { activeStep, nextStep, steps, prevStep } = useStepper((s) => s);

  const onSlotUpdate = (slot: Slot | null, tz?: string) => {
    if (slot) {
      updateSlot(slot);
    }

    if (tz) {
      setTz(tz);
    }
  };

  return (
    <>
      <div className="space-y-16">
        <div className="space-y-4">
          <h3 className="text-3xl">Pick a time for your appointment</h3>
          <p className="text-zinc-500">
            {collectionMethod === 'AT_HOME'
              ? `An appointment takes 15 minutes, your nurse will arrive during the selected time slot. We recommend booking
          within 2 hours of waking up to ensure the most accurate measurement of blood hormone levels`
              : `An appointment takes 15 minutes. We recommend booking within 2 hours of waking up to ensure the most accurate measurement of blood hormone levels.`}
          </p>
        </div>
        <div className="w-full rounded-xl bg-white p-4">
          <Scheduler
            collectionMethod={collectionMethod}
            address={location?.address as Address}
            serviceId={service.id}
            onSlotUpdate={onSlotUpdate}
            displayCancellationNote
            showCreateBtn={false}
            numDays={width > 600 ? 5 : 4}
          />
        </div>
      </div>
      <div className="flex items-center justify-between pt-12">
        <Body1 className="text-zinc-400">
          Step {activeStep + 1} of {steps.length}
        </Body1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep} disabled={!slot}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
};
