import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';

export const ConfirmAddress = () => {
  const { activeStep, steps, nextStep, prevStep } = useStepper((s) => s);
  const updateLocation = useOrder((s) => s.updateLocation);
  const { data: user } = useUser();

  const setLocation = () => {
    if (!user?.primaryAddress) {
      return;
    }

    updateLocation({ address: user.primaryAddress.address });
    nextStep();
  };

  return (
    <>
      <div className="space-y-8 p-6 md:space-y-12 md:p-14">
        <div className="space-y-4">
          <H2 className="text-2xl md:text-3xl">Confirm shipping address</H2>
          <CurrentAddressCard />
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
            onClick={setLocation}
            disabled={!user?.primaryAddress}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};
