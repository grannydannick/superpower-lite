import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

const FEATURES = [
  {
    icon: '/onboarding/introduction/membership/clinicians.webp',
    title: '24/7 Clinician support',
    description: 'Get answers on your health anytime.',
  },
  {
    icon: '/onboarding/introduction/membership/lab-data.webp',
    title: 'Upload past labs',
    description: 'See how your body trends over a lifetime.',
  },
  {
    icon: '/onboarding/introduction/membership/rx.webp',
    title: "Rx's & peptides",
    description: 'Access frontier therapeutics directly.',
  },
  {
    icon: '/onboarding/introduction/membership/diagnostics.webp',
    title: 'Curated diagnostics',
    description: 'Go deeper on gut, toxins, cancers.',
  },
  {
    icon: '/onboarding/introduction/membership/members-only.webp',
    title: 'Members-only prices',
    description: 'Buy supplements cheaper than Amazon.',
  },
];

const TIME_TO_WAIT = 5000;

export const OutroStep = () => {
  const { next } = useSequence();

  useEffect(() => {
    const timer = setTimeout(() => {
      next();
    }, TIME_TO_WAIT);

    return () => clearTimeout(timer);
  }, [next]);

  return (
    <Sequence.StepLayout
      centered
      className="relative max-h-screen justify-between overflow-hidden"
    >
      <Sequence.StepContent className="mx-auto mb-8 max-w-md text-center md:p-0">
        <H2 className="mb-8">Your membership also includes...</H2>
        <div className="w-full space-y-3 rounded-2xl bg-white p-6">
          {FEATURES.map((feature, index) => (
            <div key={feature.title}>
              <div className="flex items-start gap-4 text-left">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-medium text-primary">
                    {feature.title}
                  </h3>
                  <Body1 className="text-secondary">
                    {feature.description}
                  </Body1>
                </div>
              </div>
              {index < FEATURES.length - 1 && (
                <div
                  className="ml-auto mt-6 h-px max-w-[calc(100%-4rem)] bg-zinc-200"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </Sequence.StepContent>
      <Sequence.StepFooter>
        <Button className="pointer-events-none mx-auto w-full max-w-md opacity-0">
          Configure profile
        </Button>
      </Sequence.StepFooter>
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <TextShimmer
          className="truncate text-sm [--base-color:rgba(0,0,0,0.5)] [--base-gradient-color:#ffffff]"
          duration={2}
        >
          Configuring profile...
        </TextShimmer>
      </div>
    </Sequence.StepLayout>
  );
};
