import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { useOnboardingNavigation } from '@/features/onboarding/hooks/use-onboarding-navigation';

export const WelcomeSequence = () => {
  const { next } = useOnboardingNavigation();

  return (
    <>
      <Head title="Welcome to Superpower" />
      <main className="theme-product flex min-h-screen flex-col bg-zinc-50">
        <div className="flex items-center justify-start px-4 py-6">
          <a href="https://superpower.com">
            <SuperpowerLogo className="h-4" />
          </a>
        </div>

        <div className="flex flex-1 flex-col items-center px-4 pb-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <H2 className="text-balance">Welcome to Superpower</H2>
              <Body1 className="text-zinc-500">
                You just took the first step to taking control of your health.
              </Body1>
            </div>

            <div className="relative h-80 w-full">
              {/* Orange radial glow behind the image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 rounded-full bg-orange-400/50 blur-3xl" />
              </div>
              {/* Image with dome mask */}
              <div className="h-full w-full [mask-image:radial-gradient(ellipse_80%_65%_at_50%_38%,black_40%,transparent_75%)]">
                <img
                  src="/onboarding/introduction/women-orange.webp"
                  alt=""
                  className="h-full w-full object-cover object-top"
                  loading="eager"
                />
              </div>
              {/* Bottom fade to background */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-50 to-transparent" />
            </div>

            <div className="relative z-10 -mt-6 flex flex-col gap-3 rounded-[20px] border border-border bg-white p-5 shadow-[0px_0px_1px_0px_rgba(0,0,0,0.33),0px_24px_24px_-12px_rgba(0,0,0,0.08)]">
              <Body1>Here&apos;s what happens next:</Body1>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <span className="text-[10px] leading-none text-white">
                      1
                    </span>
                  </div>
                  <Body1 className="text-secondary">
                    Complete your health profile (8min)
                  </Body1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <span className="text-[10px] leading-none text-white">
                      2
                    </span>
                  </div>
                  <Body1 className="text-secondary">Take your blood test</Body1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <span className="text-[10px] leading-none text-white">
                      3
                    </span>
                  </div>
                  <Body1 className="text-secondary">
                    Get your personalised action plan
                  </Body1>
                </div>
              </div>
            </div>

            <Button
              onClick={next}
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
