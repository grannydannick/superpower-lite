import { Widget } from '@typeform/embed-react';
import { useNavigate } from 'react-router-dom';

import { OnboardingLayout } from '@/components/layouts/onboarding-layout';
import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';

export const TypeformIntegration = () => {
  const navigate = useNavigate();
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

  return (
    <section id="main">
      <Widget
        id="VVOeB9wb"
        className="h-[80dvh] w-[80dvw] pt-24"
        opacity={0}
        enableSandbox
        fullScreen
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
