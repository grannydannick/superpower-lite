import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL } from '@/const';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { StepID } from '@/features/orders/types/step-id';
import { useServices } from '@/features/services/api';
import { useSubscriptions } from '@/features/settings/api';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { HealthcareService } from '@/types/api';

const Booking = ({ bloodPanel }: { bloodPanel?: HealthcareService }) => {
  const { data: user } = useUser();
  const nextOnboardingStep = useStepper((s) => s.nextOnboardingStep);

  if (!bloodPanel) {
    return null;
  }

  return (
    <HealthcareServiceDialog
      healthcareService={bloodPanel}
      excludeSteps={[StepID.INFO, StepID.REFERRAL]}
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
  const subscriptionsQuery = useSubscriptions();

  const superpowerMembership = subscriptionsQuery.data?.subscriptions.find(
    (subscription) => subscription.name === 'membership',
  );

  const services = servicesQuery.data?.services;

  const bloodPanel = services?.find((s) =>
    superpowerMembership?.type === 'baseline'
      ? s.name === SUPERPOWER_BLOOD_PANEL
      : s.name === ADVANCED_BLOOD_PANEL,
  );

  return (
    <ImageContentLayout title="Booking" currentService={bloodPanel}>
      {servicesQuery.isLoading ? (
        <Loader />
      ) : superpowerMembership?.type ? (
        <Booking bloodPanel={bloodPanel} />
      ) : (
        <div className="p-6 md:p-14">
          <Body1 className="text-pink-700">
            Failed to pull membership. Please contact support so we can help
            you!
          </Body1>
        </div>
      )}
    </ImageContentLayout>
  );
};
