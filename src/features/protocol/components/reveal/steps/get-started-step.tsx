import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';

export function GetStartedStep({ next }: { next: () => void }) {
  const { data: user, isLoading } = useUser();

  return (
    <div
      className="fixed inset-0 z-10 bg-black bg-cover bg-center"
      style={{ backgroundImage: 'url(/action-plan/intro/figure.webp)' }}
    >
      {!isLoading && (
        <div className="absolute inset-x-0 bottom-32 z-10 flex flex-col items-center justify-center px-6 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-8">
          <H2 className="mb-2 text-center text-white">
            Welcome {user?.firstName}
          </H2>
          <Body1 className="mb-8 max-w-lg text-center text-white/80">
            Superpower has analyzed your lab results and identified core
            insights. Let’s build a precise protocol to address these, tailored
            to you.
          </Body1>
          <Button
            variant="glass-outline"
            className="w-full max-w-sm rounded-full"
            onClick={next}
          >
            See results
          </Button>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}
