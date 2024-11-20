import { Button } from '@/components/ui/button';
import { H1 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';

export const ContentComingSoon = () => {
  const { setIsZipBlocked } = useOnboarding();

  return (
    <section
      id="main"
      className="mx-auto flex max-w-md flex-col gap-y-12 text-center"
    >
      <div className="flex flex-col space-y-12">
        <div className="space-y-3">
          <H1 className="text-white">
            More coverage
            <br /> coming soon
          </H1>
          <p className="text-sm text-white opacity-80 md:text-base">
            While we haven’t reached your area yet, we’re actively
            <br className="hidden md:block" /> expanding. Stay tuned, and we’ll
            let you know as soon as <br className="hidden md:block" />
            we’re available nearby.
          </p>
        </div>

        <Button
          variant="ghost"
          className="text-white hover:text-white/90"
          onClick={() => setIsZipBlocked(false)}
        >
          Try another zip code
        </Button>
      </div>
    </section>
  );
};
