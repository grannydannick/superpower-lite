import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import { Sequence } from '../../sequence';

export const OnboardingLifestyleIntroStep = () => {
  const { next } = useOnboardingNavigation();

  return (
    <>
      <Head title="Lifestyle" />
      <Sequence.StepLayout centered className="bg-zinc-50">
        <Sequence.StepMedia className="flex items-center justify-center">
          <img
            src="/onboarding/questionnaire/onboarding-lifestyle.webp"
            alt=""
            className="h-auto w-full rounded-mask"
          />
        </Sequence.StepMedia>
        <Sequence.StepContent className="mx-auto max-w-md text-center">
          <H2>Let&apos;s understand your day-to-day</H2>
          <Body1 className="text-zinc-500">
            How you live shapes how your body responds. This helps us customize
            your plan.
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
