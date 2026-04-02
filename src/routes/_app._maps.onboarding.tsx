import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useEffect, useRef } from 'react';
import { preload } from 'react-dom';

import { Spinner } from '@/components/ui/spinner';
import { OnboardingFlow } from '@/features/onboarding/components/flow/onboarding-flow';
import { useTask } from '@/features/tasks/api/get-task';
import { LazyStripeProvider } from '@/lib/lazy-stripe-provider';

export const Route = createFileRoute('/_app/_maps/onboarding')({
  loader: () => {
    preload('/onboarding/shared/backgrounds/bg-female-face.webp', {
      as: 'image',
    });
    preload('/onboarding/shared/backgrounds/bg-male.webp', { as: 'image' });
    preload('/onboarding/shared/backgrounds/bg-spine.webp', { as: 'image' });
    preload('/onboarding/shared/backgrounds/bg-female-hands.webp', {
      as: 'image',
    });

    return null;
  },
  component: OnboardingComponent,
});

function OnboardingComponent() {
  const onboardingTask = useTask({
    taskName: 'onboarding',
  });

  const navigate = Route.useNavigate();
  const hasCheckedInitialLoad = useRef(false);

  useEffect(() => {
    if (onboardingTask.data == null) return;
    if (hasCheckedInitialLoad.current) return;

    if (onboardingTask.data.task.status === 'completed') {
      hasCheckedInitialLoad.current = true;
      void navigate({ to: '/', replace: true });
      return;
    }

    hasCheckedInitialLoad.current = true;
  }, [onboardingTask.data, navigate]);

  if (onboardingTask.isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (onboardingTask.data == null) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-full items-center justify-center">
          <Spinner variant="primary" size="lg" />
        </div>
      }
    >
      <LazyStripeProvider>
        <OnboardingFlow />
      </LazyStripeProvider>
    </Suspense>
  );
}
