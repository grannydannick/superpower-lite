import { Spinner } from '@/components/ui/spinner';

import { useIntakeFlow } from '../hooks/use-intake-flow';

import { IntakeStepRenderer } from './step-renderer';

export const IntakeFlow = () => {
  const { isLoading, isInitialized } = useIntakeFlow();

  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  return <IntakeStepRenderer />;
};
