import { Button } from '@/components/ui/button';
import { Body1, Body3, H1 } from '@/components/ui/typography';

export const IntakeScreen = ({ handleNext }: { handleNext: () => void }) => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start md:justify-center">
      <p className="mb-2 text-center text-sm text-white duration-300 animate-in fade-in slide-in-from-bottom-4">
        It&apos;s time to
      </p>
      <H1 className="mx-auto mb-10 max-w-md text-center text-white duration-500 animate-in fade-in slide-in-from-bottom-4 max-md:text-5xl md:max-w-xl">
        Set up your membership
      </H1>
      <Body1 className="mx-auto mb-8 max-w-sm text-balance text-center text-white duration-500 animate-in fade-in slide-in-from-bottom-4 md:max-w-lg">
        We use your intake to personalize your Superpower experience.
        <br /> <br /> Complete your comprehensive intake survey to get the best
        action plan custom to you in the next day to activate your membership.
      </Body1>
      <div className="absolute bottom-8 flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 md:static">
        <Button
          variant="white"
          className="mx-auto w-full bg-white px-8 py-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 hover:opacity-80 md:max-w-[450px]"
          onClick={handleNext}
        >
          Complete intake
        </Button>
        <Body3 className="order-first mx-auto max-w-md text-center text-white duration-500 animate-in fade-in slide-in-from-bottom-4 md:order-last">
          This is required to schedule your lab test.{' '}
          <br className="md:hidden" />
          <br className="md:hidden" /> Estimated time to complete: 20 min
        </Body3>
      </div>
    </div>
  );
};
