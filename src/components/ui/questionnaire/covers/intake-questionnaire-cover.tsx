import { useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { useAnalytics } from '@/hooks/use-analytics';

import { IntakeScreen } from './intake-screen';
import { PotentialScreen } from './potential-screen';
import { WelcomeScreen } from './welcome-screen';

export const IntakeQuestionnaireCover = ({
  handleStartQuestionnaire,
}: {
  handleStartQuestionnaire: () => void;
}) => {
  const [step, setStep] = useState<'potential' | 'welcome' | 'intake'>(
    'potential',
  );

  const { track } = useAnalytics();

  const handleNext = () => {
    if (step === 'potential') {
      setStep('welcome');
    } else if (step === 'welcome') {
      setStep('intake');
    } else {
      handleStartQuestionnaire();
      track('started_intake');
    }
  };

  return (
    <main className="flex min-h-[calc(100vh+1px)] w-full flex-col overflow-hidden bg-cover">
      <div className="absolute left-4 top-4 md:left-10 md:top-10">
        <SuperpowerLogo fill="#fff" className="w-40" />
      </div>
      <div
        className="flex w-full flex-1 flex-col items-center justify-center bg-cover bg-center p-4 py-24 md:p-16"
        style={{ backgroundImage: "url('/onboarding/bright-woman.webp')" }}
      >
        {step === 'potential' && <PotentialScreen handleNext={handleNext} />}
        {step === 'welcome' && <WelcomeScreen handleNext={handleNext} />}
        {step === 'intake' && <IntakeScreen handleNext={handleNext} />}
      </div>
    </main>
  );
};
