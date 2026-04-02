import { useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Body1, H2 } from '@/components/ui/typography';
import { useOnboardingFlowStore } from '@/features/onboarding/stores/onboarding-flow-store';
import { useUpdateTask } from '@/features/tasks/api/update-task';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

export const SignatureStep = () => {
  const navigate = useNavigate();
  const { next } = useSequence();
  const { isLastStep } = useOnboardingNavigation();
  const { mutateAsync: updateTaskProgress } = useUpdateTask();
  const resetFlow = useOnboardingFlowStore((state) => state.reset);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClear = () => {
    signatureRef.current?.clear();
    setIsEmpty(true);
  };

  const handleNext = async () => {
    if (!isLastStep) {
      next();
      return;
    }

    try {
      setIsProcessing(true);
      toast.success('Success!');
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await updateTaskProgress({
        taskName: 'onboarding',
        data: { status: 'completed' },
      });
      await navigate({ to: '/', replace: true });
      resetFlow();
    } catch {
      toast.error('Could not finish onboarding. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSignature = () => {
    if (signatureRef.current === null || signatureRef.current.isEmpty()) return;
    setIsEmpty(false);
  };

  return (
    <Sequence.StepLayout centered>
      <Sequence.StepMedia className="overflow-visible">
        <img
          src="/onboarding/commitment/your-best-self.webp"
          alt="Your best self"
          className="size-full object-contain rounded-mask"
        />
      </Sequence.StepMedia>

      <Sequence.StepContent className="relative z-10 mx-auto -mt-16 max-w-md px-0 text-center">
        <H2>Are you ready to be your best self?</H2>
        <Body1 className="text-secondary">
          We help you take control of your health.
        </Body1>
        <Body1 className="mt-4 text-secondary">
          Commit to your health by signing your name:
        </Body1>

        <div className="relative mt-6">
          <div className="relative h-28 w-full rounded-2xl border border-zinc-100 bg-white shadow-lg shadow-black/[.02]">
            <SignatureCanvas
              ref={signatureRef}
              // Avoid delayed touch updates from the old signature_pad dependency after a clear/resize.
              throttle={0}
              clearOnResize={false}
              canvasProps={{
                className: 'w-full h-full rounded-md',
                style: { background: 'transparent' },
              }}
              onEnd={handleSignature}
              backgroundColor="transparent"
              penColor="#000000"
            />
            <X className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-300" />
          </div>
        </div>
      </Sequence.StepContent>

      <Sequence.StepFooter className="mx-auto flex w-full flex-col justify-center gap-2">
        <Button
          onClick={handleNext}
          disabled={isEmpty || isProcessing}
          className="w-full max-w-md"
        >
          {isProcessing ? 'Processing...' : 'See your home for health'}
        </Button>
        <Button
          onClick={handleClear}
          variant="ghost"
          disabled={isEmpty || isProcessing}
          className="w-full max-w-md text-zinc-500 hover:text-zinc-700"
        >
          Clear signature
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
