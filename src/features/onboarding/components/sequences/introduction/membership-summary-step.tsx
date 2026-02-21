import { m } from 'framer-motion';

import { Button } from '@/components/ui/button';
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

export const MembershipSummaryStep = () => {
  const { next } = useSequence();

  return (
    <Sequence.StepLayout centered className="justify-between">
      <Sequence.StepContent className="mx-auto mb-8 max-w-md text-center md:p-0">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <H2 className="mb-8">Your membership also includes...</H2>
        </m.div>
        <m.div
          className="w-full space-y-3 rounded-2xl bg-white p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          {FEATURES.map((feature, index) => (
            <m.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.1,
                ease: 'easeOut',
              }}
            >
              <div className="flex items-start gap-4 text-left">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-primary">{feature.title}</h3>
                  <Body1 className="text-secondary">
                    {feature.description}
                  </Body1>
                </div>
              </div>
              {index < FEATURES.length - 1 && (
                <div
                  className="my-4 ml-auto h-px max-w-[calc(100%-4rem)] bg-zinc-200"
                  aria-hidden="true"
                />
              )}
            </m.div>
          ))}
        </m.div>
      </Sequence.StepContent>
      <Sequence.StepFooter>
        <Button onClick={next} className="mx-auto w-full max-w-md">
          Configure profile
        </Button>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
