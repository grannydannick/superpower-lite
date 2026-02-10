import { useNavigate } from 'react-router-dom';

import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { Sequence } from '@/features/onboarding/components/sequence';

export const CompletionStep = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/', { replace: true });
  };

  return (
    <>
      <Head title="All Done" />
      <Sequence.StepLayout centered className="bg-zinc-50">
        <Sequence.StepMedia className="flex items-center justify-center">
          <img
            src="/onboarding/questionnaire/onboarding-primer.webp"
            alt=""
            className="h-auto w-full rounded-mask"
          />
        </Sequence.StepMedia>
        <Sequence.StepContent className="mx-auto max-w-md text-center">
          <H2>You&apos;re all set</H2>
          <Body1 className="text-zinc-500">
            Thank you for completing your profile. We&apos;ll use your responses
            to personalize your experience.
          </Body1>
        </Sequence.StepContent>
        <Sequence.StepFooter className="mx-auto w-full max-w-md">
          <Button onClick={handleContinue} className="w-full">
            Continue
          </Button>
        </Sequence.StepFooter>
      </Sequence.StepLayout>
    </>
  );
};
