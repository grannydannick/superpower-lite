import { Scheduler } from '@/components/shared/scheduler';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useStepper } from '@/lib/stepper';
import { Address, CollectionMethodType, Slot } from '@/types/api';

export const PhlebotomyScheduler = () => {
  const { service, location, collectionMethod, updateSlot, setTz, slot } =
    useOrder((s) => s);
  const { width } = useWindowDimensions();
  const { activeStep, nextStep, steps, prevStep } = useStepper((s) => s);

  if (!collectionMethod) {
    throw new Error(
      'Collection method must be defined to use PhlebotomyScheduler',
    );
  }

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
      <div className="p-6 md:p-14">
        <div className="space-y-1 pb-4">
          <H2>Pick a time for your appointment</H2>
          <Body1 className="text-zinc-500">
            {collectionMethod === 'AT_HOME'
              ? `An appointment takes 15 minutes, your nurse will arrive during the selected time slot. We recommend booking
          within 2 hours of waking up to ensure the most accurate measurement of blood hormone levels`
              : `An appointment takes 15 minutes. We recommend booking within 2 hours of waking up to ensure the most accurate measurement of blood hormone levels.`}
          </Body1>
        </div>
        <div className="w-full rounded-xl py-6">
          <Scheduler
            collectionMethod={collectionMethod as CollectionMethodType}
            address={location?.address as Address}
            serviceId={service.id}
            onSlotUpdate={onSlotUpdate}
            displayCancellationNote={collectionMethod !== 'IN_LAB'}
            showCreateBtn={false}
            numDays={width > 600 ? 5 : 4}
          />
        </div>
      </div>
      <div className="flex items-center px-6 pb-12 md:justify-between md:px-14">
        <Body1 className="hidden text-zinc-400 md:block">
          Step {activeStep + 1} of {steps.length}
        </Body1>
        <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={prevStep}
          >
            Back
          </Button>
          <Button
            onClick={nextStep}
            disabled={!slot}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};
