import { Button } from '@/components/ui/button';
import { H2 } from '@/components/ui/typography';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';

export const ConfirmAddress = () => {
  const nextStep = useStepper((s) => s.nextStep);
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
      <HealthcareServiceFooter
        nextBtn={
          <Button
            onClick={setLocation}
            disabled={!user?.primaryAddress}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        }
      />
    </>
  );
};
