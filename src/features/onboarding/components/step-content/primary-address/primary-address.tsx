import { OnboardingLayout } from '@/components/layouts/onboarding-layout';
import { Body1, H1 } from '@/components/ui/typography';
import { ContentComingSoon } from '@/features/onboarding/components/coming-soon';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useUser } from '@/lib/auth';

import { PrimaryAddressForm } from './primary-address-form';

export const PrimaryAddress = () => {
  const { isZipBlocked } = useOnboarding();
  const { data } = useUser();

  if (isZipBlocked) {
    return <ContentComingSoon />;
  }

  return (
    <section
      id="main"
      className="mx-auto flex max-w-[807px] flex-col items-center gap-8"
    >
      <div className="space-y-3 text-center">
        <Body1 className="text-white opacity-80">Hello {data?.firstName}</Body1>
        <H1 className="text-white">
          Where do you live or primarily plan to receive services?
        </H1>
      </div>
      <div className="w-full max-w-[480px]">
        <PrimaryAddressForm />
      </div>
    </section>
  );
};

export const PrimaryAddressStep = () => {
  const { isZipBlocked } = useOnboarding();

  return (
    <OnboardingLayout title="Address" showAvailableStates={isZipBlocked}>
      <PrimaryAddress />
    </OnboardingLayout>
  );
};
