import { createFileRoute } from '@tanstack/react-router';

import { getOnboardingAddOnsQueryOptions } from '@/features/add-on-panels/api/add-on-panels';
import { OnboardingFlow } from '@/features/onboarding/components/flow/onboarding-flow';
import { ONBOARDING_STEP_IDS } from '@/features/onboarding/components/flow/onboarding-step-manifest';

export const Route = createFileRoute('/_app/_maps/onboarding/$step')({
  loader: async ({ context, params }) => {
    if (params.step !== ONBOARDING_STEP_IDS.ADD_ON_PANELS) {
      return null;
    }

    await Promise.all([
      import('@/features/add-on-panels/add-on-panels-step'),
      context.queryClient.ensureQueryData(getOnboardingAddOnsQueryOptions()),
    ]);

    return null;
  },
  component: OnboardingStepRouteComponent,
});

function OnboardingStepRouteComponent() {
  const { step } = Route.useParams();

  return <OnboardingFlow stepPath={step} />;
}
