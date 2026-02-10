import { useNavigate } from 'react-router-dom';

import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { Sequence } from '@/features/onboarding/components/sequence';
import { useOnboardingNavigation } from '@/features/onboarding/hooks/use-onboarding-navigation';
import { useGender } from '@/hooks/use-gender';
import { dismissIntake } from '@/lib/intake-dismiss';

const SPLASH_IMAGES = {
  female: '/onboarding/shared/backgrounds/bg-female-face.webp',
  male: '/onboarding/shared/backgrounds/bg-male.webp',
} as const;

export const SplashStep = () => {
  const { next } = useOnboardingNavigation();
  const navigate = useNavigate();
  const { gender } = useGender();

  const skip = () => {
    dismissIntake();
    navigate('/', { replace: true });
  };

  return (
    <>
      <Head title="Update Your Profile" />
      <Sequence.StepLayout centered className="bg-zinc-50">
        <Sequence.StepMedia className="flex items-center justify-center">
          <img
            src={SPLASH_IMAGES[gender ?? 'male']}
            alt=""
            className="h-auto w-full rounded-mask"
          />
        </Sequence.StepMedia>
        <Sequence.StepContent className="mx-auto max-w-md text-center">
          <H2>A lot has changed since your last test</H2>
          <Body1 className="text-zinc-500">
            Please take a few minutes to update your goals, health history,
            nutrition, and lifestyle.
          </Body1>
        </Sequence.StepContent>
        <Sequence.StepFooter className="mx-auto w-full max-w-md">
          <div className="flex w-full flex-col gap-3">
            <Button onClick={next} className="w-full">
              Update now
            </Button>
            <button
              type="button"
              onClick={skip}
              className="text-sm text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-700"
            >
              Not now
            </button>
          </div>
        </Sequence.StepFooter>
      </Sequence.StepLayout>
    </>
  );
};
