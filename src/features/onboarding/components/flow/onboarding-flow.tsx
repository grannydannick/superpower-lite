import { Spinner } from '@/components/ui/spinner';
import { StepRenderer } from '@/features/onboarding/components/flow/step-renderer';
import { useOnboardingFlow } from '@/features/onboarding/hooks/use-onboarding-flow';

export const OnboardingFlow = () => {
  const { isLoading, isInitialized } = useOnboardingFlow();

  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  return <StepRenderer />;
};
