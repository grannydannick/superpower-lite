import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import { Sequence } from '../../sequence';

export const OnboardingMedicalHistoryIntroStep = () => {
  const { next } = useOnboardingNavigation();

  return (
    <>
      <Head title="Medical History" />
      <Sequence.StepLayout centered className="bg-zinc-50">
        <Sequence.StepMedia className="flex items-center justify-center">
          <img
            src="/onboarding/questionnaire/onboarding-medical-history.webp"
            alt=""
            className="h-auto w-full rounded-mask"
          />
        </Sequence.StepMedia>
        <Sequence.StepContent className="mx-auto max-w-md text-center">
          <H2>Let&apos;s go over your medical history</H2>
          <Body1 className="text-zinc-500">
            Your history has signals. Include detail for more accurate and
            personalized insights.
          </Body1>
        </Sequence.StepContent>
        <Sequence.StepFooter className="mx-auto w-full max-w-md">
          <Button onClick={next} className="w-full">
            Next
          </Button>
        </Sequence.StepFooter>
      </Sequence.StepLayout>
    </>
  );
};
