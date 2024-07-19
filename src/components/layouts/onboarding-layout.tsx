import { ChevronLeft } from 'lucide-react';

import logoWhite from '@/assets/logo.svg';
import { Button } from '@/components/ui/button';

const OnboardingStepLayoutHeader = ({
  prevStep,
}: {
  prevStep?: () => void;
}) => {
  return (
    <section
      id="header"
      className="flex w-full items-center justify-between p-6"
    >
      {prevStep ? (
        <Button
          variant="glass"
          className="size-12 rounded-full"
          onClick={() => {
            prevStep();
          }}
        >
          <ChevronLeft />
        </Button>
      ) : (
        <div className="size-12" />
      )}
      <div className="w-[114px]">
        <img className="w-auto" src={logoWhite} alt="logo" />
      </div>
      <div className="size-12" />
    </section>
  );
};

export type OnboardingStepWrapperProps = {
  children: JSX.Element;
  prevStep?: () => void;
};

export const OnboardingStepLayout = (props: OnboardingStepWrapperProps) => {
  return (
    <div className="flex min-h-screen w-full flex-col justify-between">
      <OnboardingStepLayoutHeader prevStep={props.prevStep} />
      <div>{props.children}</div>
      <section id="footer"></section>
    </div>
  );
};
