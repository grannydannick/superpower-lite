import { Spinner } from '@/components/ui/spinner';
import { SUPERPOWER_BLOOD_PANEL } from '@/const';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { StepID } from '@/features/orders/utils/get-steps-for-service';
import { useServices } from '@/features/services/api';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { HealthcareService } from '@/types/api';

const Booking = ({ bloodPanel }: { bloodPanel?: HealthcareService }) => {
  const { data: user } = useUser();
  const nextOnboardingStep = useStepper((s) => s.nextOnboardingStep);

  if (!bloodPanel) {
    // TODO: add better errors handling
    return null;
  }

  return (
    <HealthcareServiceDialog
      healthcareService={bloodPanel}
      excludeSteps={[StepID.INFO]}
      onSubmit={() =>
        user?.onboarding ? nextOnboardingStep(user.onboarding.id) : undefined
      }
    />
  );
};

const Loader = () => {
  return (
    <div className="flex h-48 w-full items-center justify-center">
      <Spinner variant="primary" size="lg" />
    </div>
  );
};

export const BookingStep = () => {
  const servicesQuery = useServices();

  const services = servicesQuery.data?.services;
  const bloodPanel = services?.find((s) => s.name === SUPERPOWER_BLOOD_PANEL);

  return (
    <ImageContentLayout title="Booking" currentService={bloodPanel}>
      {servicesQuery.isLoading ? (
        <Loader />
      ) : (
        <Booking bloodPanel={bloodPanel} />
      )}
    </ImageContentLayout>
  );
};
