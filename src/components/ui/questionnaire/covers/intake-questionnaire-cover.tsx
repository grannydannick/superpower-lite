import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Body2, H1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { ONBOARDING_FEATURES } from './const/onboarding-features';

export const IntakeQuestionnaireCover = ({
  handleStartQuestionnaire,
}: {
  handleStartQuestionnaire: () => void;
}) => {
  return (
    <main className="flex min-h-[calc(100vh+1px)] w-full flex-col overflow-hidden bg-cover">
      <div className="absolute left-4 top-4 md:left-10 md:top-10">
        <SuperpowerLogo fill="#fff" className="w-40" />
      </div>
      <div
        className="flex w-full flex-1 flex-col items-center justify-center bg-cover bg-center p-4 py-24 md:p-16"
        style={{ backgroundImage: "url('/onboarding/bg-male-v2.webp')" }}
      >
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <p className="mb-2 text-center text-sm text-white md:mb-6">
            Payment Successful!
          </p>
          <H1 className="mx-auto mb-6 max-w-md text-center text-white md:max-w-xl">
            Welcome to Superpower
          </H1>
          <Body2 className="mx-auto mb-8 max-w-md text-center text-white md:max-w-xl">
            Please continue to setup your account and build your personal health
            profile.
          </Body2>
          <div className="mx-auto mb-16 w-full max-w-xl rounded-2xl border border-white/[16%] bg-white/15 p-6 backdrop-blur-md">
            <div className="space-y-4">
              {ONBOARDING_FEATURES.map((feature, index) => (
                <div key={feature} className="flex items-start gap-2">
                  <AnimatedCheckIcon
                    fill="white"
                    delay={index * 0.4}
                    className="mt-px"
                  />
                  <Body2
                    className="text-white animate-in fade-in"
                    style={{ animationDuration: `${index * 0.8}s` }}
                  >
                    {feature}
                  </Body2>
                </div>
              ))}
            </div>
          </div>
          <button
            className="mx-auto w-full max-w-xs rounded-full bg-white px-8 py-4 transition-all hover:opacity-80"
            onClick={handleStartQuestionnaire}
          >
            Continue setup
          </button>
        </div>
      </div>
    </main>
  );
};

const AnimatedCheckIcon = ({
  fill = 'currentColor',
  delay,
  className,
}: {
  fill: string;
  delay?: number;
  className?: string;
}) => {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: `check-icon-animation ${delay}s ease-out forwards`,
      }}
      className={cn('shrink-0', className)}
    >
      <style>
        {`
          @keyframes check-icon-animation {
            0% {
              transform: scale(0);
            }
            100% {
              transform: scale(1);
            }
          }
          @keyframes stroke-animation {
            0% {
              stroke-dashoffset: -24;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
      <path
        d="M13.7824 4.61133L6.44906 11.9447L3.11572 8.61133"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: '24',
          strokeDashoffset: '-24',
          animation: `stroke-animation ${delay}s ease-in-out forwards`,
        }}
      />
    </svg>
  );
};
