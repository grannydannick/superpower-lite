import bgFemaleHands from '@/assets/onboarding/bg-female-hands.png';
import bgFemaleSpotlight from '@/assets/onboarding/bg-female-spotlight.png';
import bgMaleLarge from '@/assets/onboarding/bg-male-large.png';
import bgSpine from '@/assets/onboarding/bg-spine.png';
import { OnboardingStepLayout } from '@/components/layouts/onboarding-layout';
import { Onboarding2faAuth } from '@/features/onboarding/components/step-content/onboarding-2fa-auth';
import { OnboardingCommitment } from '@/features/onboarding/components/step-content/onboarding-commitment';
import { OnboardingMission } from '@/features/onboarding/components/step-content/onboarding-mission';
import { OnboardingPrimaryAddress } from '@/features/onboarding/components/step-content/onboarding-primary-address';
import { Questionnaire, Step } from '@/features/questionnaire';

export const OnboardingRoute = () => {
  const bgImageStyle = {
    backgroundImage: `url(${bgSpine})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };

  return (
    <Questionnaire>
      <Step name={'primary-address'} conversational={false}>
        {({ nextStep }) => (
          <>
            <div
              className="flex min-h-screen w-full flex-col justify-between"
              style={{
                ...bgImageStyle,
                backgroundImage: `url(${bgMaleLarge})`,
              }}
            >
              <OnboardingStepLayout>
                <OnboardingPrimaryAddress nextStep={nextStep} />
              </OnboardingStepLayout>
            </div>
          </>
        )}
      </Step>
      <Step name={'2fa-auth'} conversational={false}>
        {({ prevStep, nextStep }) => (
          <>
            <div
              className="flex min-h-screen w-full flex-col justify-between"
              style={{
                ...bgImageStyle,
                backgroundImage: `url(${bgFemaleSpotlight})`,
              }}
            >
              <OnboardingStepLayout prevStep={prevStep}>
                <Onboarding2faAuth nextStep={nextStep} />
              </OnboardingStepLayout>
            </div>
          </>
        )}
      </Step>
      <Step name={'mission'} conversational={false}>
        {({ prevStep, nextStep }) => (
          <>
            <div
              className="flex min-h-screen w-full flex-col justify-between"
              style={{ ...bgImageStyle, backgroundImage: `url(${bgSpine})` }}
            >
              <OnboardingStepLayout prevStep={prevStep}>
                <OnboardingMission nextStep={nextStep} />
              </OnboardingStepLayout>
            </div>
          </>
        )}
      </Step>
      <Step name={'commitment'} conversational={false}>
        {({ prevStep, nextStep }) => (
          <>
            <div
              className="flex min-h-screen w-full flex-col justify-between"
              style={{
                ...bgImageStyle,
                backgroundImage: `url(${bgFemaleHands})`,
              }}
            >
              <OnboardingStepLayout prevStep={prevStep}>
                <OnboardingCommitment nextStep={nextStep} />
              </OnboardingStepLayout>
            </div>
          </>
        )}
      </Step>
    </Questionnaire>
  );
};
