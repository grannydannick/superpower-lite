import { useEffect } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { ConfiguratorSections } from '@/features/onboarding/components/configurator/configurator-sections';
import { FaqSection } from '@/features/onboarding/components/configurator/faq-section';
import { ConfiguratorLayout } from '@/features/onboarding/components/layouts';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

export const Configurator = () => {
  const { data: user } = useUser();
  const { nextOnboardingStep } = useStepper((s) => s);

  /**
   * If user already paid but something happened
   * we advance user to resolve weird UI state
   */
  useEffect(() => {
    if (user && user.subscribed) {
      console.warn('User already subscribed, advancing step...');
      nextOnboardingStep(user.onboarding.id);
    }
  }, []);

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-6 items-center justify-between flex-1 bg-zinc-50 p-8',
        )}
      >
        <SuperpowerLogo />
        <img
          src="/onboarding/dashboard.png"
          className="h-[156px] w-full max-w-[240px] object-cover lg:h-auto lg:max-w-[423px]"
          alt="dashboard"
        />
        <FaqSection />
      </div>
      <ConfiguratorSections />
    </>
  );
};

export const ConfiguratorStep = () => (
  <ConfiguratorLayout title="Configurator">
    <Configurator />
  </ConfiguratorLayout>
);
