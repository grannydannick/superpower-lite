import React from 'react';

import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Button } from '@/components/ui/button';
import { Timeline } from '@/components/ui/timeline';
import { H2 } from '@/components/ui/typography';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useStepper } from '@/lib/stepper';
import { TimelineType } from '@/types/timeline';

export const BookingSuccess = () => {
  const { nextOnboardingStep } = useStepper((s) => s);
  const { serviceAddress, slots, collectionMethod } = useOnboarding();

  const timeline: TimelineType[] = [
    { title: 'Membership confirmed', complete: true },
    {
      title: 'Schedule your appointment',
      complete: true,
    },
    {
      title: collectionMethod === 'IN_LAB' ? 'In-person lab' : 'At-home visit',
      complete: false,
    },
    { title: 'Test results processed within 10 days', complete: false },
    { title: 'Results uploaded', complete: false },
    { title: 'Schedule a follow-up appointment', complete: false },
  ];

  return (
    <section id="main">
      <div className="space-y-8">
        <H2 className="text-zinc-900">
          Thank you, we look forward to seeing you shortly.
        </H2>

        <Timeline timeline={timeline} />
        <div className="flex w-full justify-end gap-3 py-12">
          {serviceAddress && collectionMethod && slots.blood.slot && (
            <AddToCalendar
              address={serviceAddress.address}
              slot={slots.blood.slot}
              service="Superpower Blood Panel"
              collectionMethod={collectionMethod}
            />
          )}
          <Button onClick={() => nextOnboardingStep()}>Done</Button>
        </div>
      </div>
    </section>
  );
};

export const BookingSuccessStep = () => (
  <ImageContentLayout
    title="Success"
    className="bg-female-stretching"
    blockBackButton
  >
    <BookingSuccess />
  </ImageContentLayout>
);
