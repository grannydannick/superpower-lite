import { createFileRoute } from '@tanstack/react-router';

import { OnboardingIndexRedirect } from '@/features/onboarding/components/flow/onboarding-flow';

export const Route = createFileRoute('/_app/_maps/onboarding/')({
  component: OnboardingIndexRouteComponent,
});

function OnboardingIndexRouteComponent() {
  return <OnboardingIndexRedirect />;
}
