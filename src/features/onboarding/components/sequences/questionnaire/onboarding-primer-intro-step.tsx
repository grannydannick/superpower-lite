import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import { Sequence } from '../../sequence';

export const OnboardingPrimerIntroStep = () => {
  const { next } = useOnboardingNavigation();

  return (
    <>
      <Head title="Tell Us About Yourself" />
      <Sequence.StepLayout centered className="bg-zinc-50">
        <Sequence.StepMedia className="flex items-center justify-center">
          <img
            src="/onboarding/questionnaire/onboarding-primer.webp"
            alt=""
            className="h-auto w-full rounded-mask"
          />
        </Sequence.StepMedia>
        <Sequence.StepContent className="mx-auto max-w-md text-center">
          <H2>Tell us about yourself</H2>
          <Body1 className="text-zinc-500">
            Your responses will inform your experience. Set aside 10 min for the
            best result.
          </Body1>
        </Sequence.StepContent>
        <Sequence.StepFooter className="mx-auto w-full max-w-md">
          <Button onClick={next} className="w-full">
            Set up your twin
          </Button>
        </Sequence.StepFooter>
      </Sequence.StepLayout>
    </>
  );
};
