import {
  IconNumber1Circle,
  IconNumber2Circle,
  IconNumber3Circle,
} from '@central-icons-react/round-filled-radius-2-stroke-1.5';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Body1, H2 } from '@/components/ui/typography';
import { useOnboardingNavigation } from '@/features/onboarding/hooks/use-onboarding-navigation';
import { setOnboardingProgress } from '@/features/onboarding/stores/onboarding-progress-store';
import { useUser } from '@/lib/auth';

import { DomeImage } from './dome-image';

const NEXT_STEPS = [
  {
    Icon: IconNumber1Circle,
    label: 'Complete your health profile (8min)',
  },
  {
    Icon: IconNumber2Circle,
    label: 'Take your blood test',
  },
  {
    Icon: IconNumber3Circle,
    label: 'Get your personalised action plan',
  },
] as const;

export const WelcomeSequence = () => {
  const { next } = useOnboardingNavigation();
  const { data: user } = useUser();

  const handleNext = () => {
    if (user != null) setOnboardingProgress(user.id, 'hasSeenWelcome', true);
    next();
  };

  return (
    <>
      <Head title="Welcome to Superpower" />
      <main className="theme-product relative flex min-h-screen flex-col bg-zinc-50">
        <div className="flex items-center justify-start px-4 py-6">
          <a href="https://superpower.com" className="hidden md:block">
            <SuperpowerLogo className="h-4" />
          </a>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-between overflow-x-hidden px-4 pb-8 md:justify-center md:pb-12">
          <div className="relative flex w-full max-w-md flex-1 flex-col justify-between gap-12 md:justify-center">
            <div></div>

            <div className="pb-12">
              <div className="flex flex-col items-center gap-2 text-center">
                <H2 className="text-balance">Welcome to Superpower</H2>
                <Body1 className="text-zinc-500">
                  You just took the first step to taking control of your health.
                </Body1>
              </div>
              <DomeImage
                src="/onboarding/introduction/women-orange.webp"
                hasTransition
              />

              <Card className="relative z-10 mx-auto -mt-12 w-full max-w-sm shadow-xl shadow-black/5 ring-1 ring-black/5">
                <CardHeader className="pb-3">
                  <h3 className="text-lg">Here&apos;s what happens next:</h3>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {NEXT_STEPS.map((step) => {
                    const Icon = step.Icon;
                    return (
                      <div key={step.label} className="flex items-center gap-2">
                        <Icon className="size-5 text-tertiary" />
                        <Body1 className="text-secondary">{step.label}</Body1>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
            <Button
              onClick={handleNext}
              variant="default"
              className="h-14 w-full rounded-xl text-base"
            >
              Let's go
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};
