import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Suspense } from 'react';
import { preload } from 'react-dom';

import { Spinner } from '@/components/ui/spinner';
import { getOnboardingQueryOptions } from '@/features/onboarding/api/onboarding';
import { LazyStripeProvider } from '@/lib/lazy-stripe-provider';

export const Route = createFileRoute('/_app/_maps/onboarding')({
  loader: async ({ context }) => {
    preload('/onboarding/shared/backgrounds/bg-female-face.webp', {
      as: 'image',
    });
    preload('/onboarding/shared/backgrounds/bg-male.webp', { as: 'image' });
    preload('/onboarding/shared/backgrounds/bg-spine.webp', { as: 'image' });
    preload('/onboarding/shared/backgrounds/bg-female-hands.webp', {
      as: 'image',
    });

    const onboarding = await context.queryClient.ensureQueryData(
      getOnboardingQueryOptions(),
    );
    if (onboarding.status.state === 'completed') {
      throw redirect({ to: '/', replace: true });
    }

    return null;
  },
  component: OnboardingComponent,
});

function OnboardingComponent() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-full items-center justify-center">
          <Spinner variant="primary" size="lg" />
        </div>
      }
    >
      <LazyStripeProvider>
        <Outlet />
      </LazyStripeProvider>
    </Suspense>
  );
}
