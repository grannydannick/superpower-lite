import { createFileRoute, Navigate } from '@tanstack/react-router';

import { Head } from '@/components/seo';
import { Spinner } from '@/components/ui/spinner';
import { useRevealLatest } from '@/features/protocol/api';
import { useRevealStepper } from '@/features/protocol/components/reveal/reveal-stepper';

export const Route = createFileRoute('/_app/protocol/reveal/')({
  component: ProtocolRevealIndexComponent,
});

function ProtocolRevealIndexComponent() {
  const { data: revealData } = useRevealLatest();
  const carePlanId: string | null = revealData?.carePlanId ?? null;
  const { initialStep, isLoading, protocol } = useRevealStepper(
    carePlanId ?? undefined,
    undefined,
  );

  if (isLoading) {
    return (
      <>
        <Head title="Your Health Protocol" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner variant="primary" />
        </div>
      </>
    );
  }

  if (revealData?.revealCompleted) {
    return <Navigate to="/protocol" replace />;
  }

  if (carePlanId == null || protocol == null || initialStep == null) {
    console.error('Missing care plan id or protocol', {
      carePlanId,
      protocol,
    });
    return <Navigate to="/protocol" replace />;
  }

  return (
    <Navigate
      to="/protocol/reveal/$step"
      params={{ step: initialStep }}
      replace
    />
  );
}
