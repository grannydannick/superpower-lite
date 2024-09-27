import { Widget } from '@typeform/embed-react';
import { useNavigate } from 'react-router-dom';

import { OnboardingLayout } from '@/components/layouts/onboarding-layout';
import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';

export const TypeformIntegration = () => {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { refetch } = useUser();

  const completeOnboarding = async () => {
    await api.put(`users/onboarding`, {
      status: 'COMPLETE',
    });

    await refetch();
    localStorage.removeItem('onboarding');
    navigate('/', {
      replace: true,
    });

    // for some reason typeform doesnt unmount after we get
    // to app so we need to manually refresh page
    window.location.reload();
  };

  // Check if in development environment
  const isDev = import.meta.env.DEV;

  return (
    <section id="main">
      <Widget
        id="VVOeB9wb"
        className="h-dvh w-full pt-24 sm:h-[80dvh] md:w-[80dvw]"
        opacity={0}
        enableSandbox={isDev}
        fullScreen
        transitiveSearchParams={['email']}
        hidden={{
          email: user?.email ?? '',
        }}
        onSubmit={completeOnboarding}
      />
    </section>
  );
};

export const TypeformIntegrationStep = () => (
  <OnboardingLayout title="Typeform">
    <TypeformIntegration />
  </OnboardingLayout>
);
