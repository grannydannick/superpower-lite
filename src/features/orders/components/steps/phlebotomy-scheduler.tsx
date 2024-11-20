import { Scheduler } from '@/components/shared/scheduler';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useStepper } from '@/lib/stepper';
import { Address, Slot } from '@/types/api';

export const PhlebotomyScheduler = () => {
  const { service, location, collectionMethod, updateSlot, setTz, slot } =
    useOrder((s) => s);
  const { width } = useWindowDimensions();
  const nextStep = useStepper((s) => s.nextStep);

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
            collectionMethod={collectionMethod}
            address={location?.address as Address}
            serviceId={service.id}
            onSlotUpdate={onSlotUpdate}
            displayCancellationNote={collectionMethod !== 'IN_LAB'}
            showCreateBtn={false}
            numDays={width > 600 ? 5 : 4}
          />
        </div>
      </div>
      <HealthcareServiceFooter
        nextBtn={
          <Button
            onClick={nextStep}
            disabled={!slot}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        }
      />
    </>
  );
};
