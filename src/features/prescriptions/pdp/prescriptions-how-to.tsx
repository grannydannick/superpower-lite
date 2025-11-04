import { Body2, H2, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import type { Rx } from '@/types/api';

type PrescriptionsHowToProps = {
  prescription: Rx;
  className?: string;
};

const HOW_TO_STEPS = [
  {
    title: '1. Fill out questionnaire',
    description:
      'Take our eligibility assessment to make sure you’re qualified.',
    imageSrc: '/rx/questionnaire.webp',
    imageAlt: 'Person completing questionnaire',
  },
  {
    title: '2. Doctor consultation',
    description: 'Video call with specialists who understand male metabolism.',
    imageSrc: '/rx/consultation.webp',
    imageAlt: 'Doctor during a virtual consultation',
  },
  {
    title: '3. Delivery',
    description: 'Doctor-trusted medications shipped discreetly to your door.',
    imageSrc: '/rx/delivery.webp',
    imageAlt: 'Medication bottle ready for delivery',
  },
  {
    title: '4. Support',
    description: 'Weekly check-ins, adjustments, and 24/7 provider access.',
    imageSrc: '/rx/support.webp',
    imageAlt: 'Person messaging their care team',
  },
];

export const HowTo = ({ prescription, className }: PrescriptionsHowToProps) => {
  return (
    <section className={cn('space-y-8', className)}>
      <H2 className="tracking-tight">
        How to get started with {prescription.name}
      </H2>
      <div className="flex flex-col gap-6">
        <div className="flex snap-x gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          {HOW_TO_STEPS.map((step) => (
            <article
              key={step.title}
              className="group snap-start space-y-5 rounded-[24px]"
            >
              <div className="relative aspect-square overflow-hidden rounded-[24px]">
                <img
                  src={step.imageSrc}
                  alt={step.imageAlt}
                  className="size-full min-w-[320px] object-cover"
                />
              </div>
              <div className="space-y-2">
                <H4 className="text-primary">{step.title}</H4>
                <Body2 className="text-base text-secondary">
                  {step.description}
                </Body2>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
