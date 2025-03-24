import { useState } from 'react';

import { OnboardingLayout } from '@/components/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, H1 } from '@/components/ui/typography';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useStepper } from '@/lib/stepper';

import { SignatureBlock } from '../signature-block';

export const Commitment = () => {
  const { nextStep, activeStep } = useStepper((s) => s);
  const {
    mutateAsync: updateTaskProgress,
    isError,
    isPending,
  } = useUpdateTask();

  const [enableNext, setEnableNext] = useState(false);

  const updateStep = async () => {
    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: activeStep },
    });

    if (!isError) {
      nextStep();
    }
  };

  return (
    <section className="mx-auto flex max-w-[500px] flex-col gap-y-12 py-12">
      <div className="flex flex-col space-y-12">
        <div className="space-y-8">
          <H1 className="text-white">Your commitment to health</H1>
          <Body1 className="text-white opacity-60">
            Every member of Superpower makes the same commitment
          </Body1>
          <div className="space-y-6">
            <div className="flex flex-row gap-x-4">
              <Body1 className="text-white opacity-60">1</Body1>
              <Body1 className="text-white">
                I commit to truly putting my health first, always.
              </Body1>
            </div>
            <div className="flex flex-row gap-x-4">
              <Body1 className="text-white opacity-60">2</Body1>
              <Body1 className="text-white">
                I realize that optimal health is a daily journey, not a
                destination.
              </Body1>
            </div>
            <div className="flex flex-row gap-x-4">
              <Body1 className="text-white opacity-60">3</Body1>
              <Body1 className="text-white">
                I believe that if I superpower my health, I can superpower my
                life.
              </Body1>
            </div>
          </div>
        </div>
        <div>
          <SignatureBlock setNext={setEnableNext} />
        </div>
        <Button
          onClick={updateStep}
          disabled={!enableNext || isPending}
          type="submit"
          className="w-full"
          variant="white"
        >
          {isPending ? (
            <Spinner variant="primary" />
          ) : (
            'I’m committed to my health'
          )}
        </Button>
      </div>
    </section>
  );
};

export const CommitmentStep = () => (
  <OnboardingLayout className="bg-female-hands" title="Commitment">
    <Commitment />
  </OnboardingLayout>
);
