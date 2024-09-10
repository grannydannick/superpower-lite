import { OnboardingLayout } from '@/components/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { Body1, H1, H3 } from '@/components/ui/typography';
import { useStepper } from '@/lib/stepper';

export const Mission = () => {
  const { nextOnboardingStep } = useStepper((s) => s);

  return (
    <section
      id="main"
      className="mx-auto flex max-w-[500px] flex-col gap-y-12 py-20"
    >
      <div className="flex flex-col space-y-12">
        <div className="space-y-12">
          <div className="my-24 md:my-0">
            <H1 className="text-white">Perform better</H1>
            <H1 className="text-white">Live longer</H1>
          </div>
          <div className="space-y-1">
            <Body1 className="text-white opacity-60">Our Mission</Body1>
            <H3 className="text-white">
              We built Superpower for people who want more. We believe that if
              you improve your health, you can improve every other aspect of
              your life.
            </H3>
          </div>

          <H3 className="text-white">
            But mainstream medicine hasn’t helped many of us do that. It ignores
            red flags, reacts too late, and misses the full picture.
          </H3>

          <H3 className="text-white">
            Our vision of the future is a completely different system – where
            proactive health is the norm. Where it’s easy to slow aging and
            prevent disease. Where our food and environments are default healthy
            and toxin free. Where everyone is able to reach their peak
            potential.
          </H3>

          <H3 className="text-white">
            It&apos;s time to unleash your inner Superpower.
          </H3>
        </div>
        <Button
          onClick={() => {
            nextOnboardingStep();
          }}
          type="submit"
          className="w-full"
          variant="white"
        >
          Continue
        </Button>
      </div>
    </section>
  );
};

export const MissionStep = () => (
  <OnboardingLayout title="Mission">
    <Mission />
  </OnboardingLayout>
);
