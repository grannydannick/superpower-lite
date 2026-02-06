import { useNavigate } from 'react-router-dom';

import {
  AppleCalendarButton,
  GoogleCalendarButton,
} from '@/components/shared/add-to-calendar-button';
import { AnimatedTimeline } from '@/components/ui/animated-timeline';
import { Button } from '@/components/ui/button';
import { Body1, Body3, H2 } from '@/components/ui/typography';
import { useCredits } from '@/features/orders/api/credits';
import { useServices } from '@/features/services/api';
import { useCheckLocation } from '@/hooks/use-check-location';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { useScheduleStore } from '../../../stores/schedule-store';
import { getTimeline } from '../../../utils/get-timeline';
import { ScheduleFlowFooter } from '../schedule-flow-footer';
import { ScheduleFlowStepper } from '../schedule-stepper';

export const ScheduleSuccessStep = () => {
  const {
    slot,
    collectionMethod,
    location,
    reset: resetStore,
    onDone,
    mode,
  } = useScheduleStore((s) => s);
  const { reset: resetSteps } = ScheduleFlowStepper.useStepper();
  const creditsQuery = useCredits();
  const servicesQuery = useServices({ includeUnorderable: true });
  const navigate = useNavigate();
  const isOnOnboarding = useCheckLocation('/onboarding');

  const resetEverything = () => {
    resetStore();
    resetSteps();
  };

  const timelineSteps = getTimeline(collectionMethod ?? undefined, mode);
  const { data: user } = useUser();

  const credits = creditsQuery.data?.credits ?? [];
  const services = servicesQuery.data?.services ?? [];

  // TODO: ideally omit this step and return this data from credits endpoint
  const creditedServiceIds = new Set(
    credits.map((c) => c.serviceId).filter((id): id is string => Boolean(id)),
  );
  const creditedServices = services.filter(
    (s) => creditedServiceIds.has(s.id) && s.group === mode,
  );

  const renderCalendarButtons = () => {
    if (!location?.address) {
      return null;
    }
    if (!collectionMethod) {
      return null;
    }
    if (!slot) {
      return null;
    }

    return (
      <>
        <AppleCalendarButton
          address={location.address}
          slot={slot}
          collectionMethod={collectionMethod}
          className="justify-center border border-zinc-100 bg-white shadow shadow-black/[.02] transition-all duration-200"
        />
        <GoogleCalendarButton
          address={location.address}
          slot={slot}
          collectionMethod={collectionMethod}
          className="justify-center border border-zinc-100 bg-white shadow shadow-black/[.02] transition-all duration-200"
        />
      </>
    );
  };

  const nextBtn = isOnOnboarding ? (
    <div className="w-full space-y-2">
      {renderCalendarButtons()}

      <Button
        className="w-full"
        variant={'default'}
        onClick={() => (onDone ? onDone() : navigate('/'))}
      >
        Done
      </Button>
    </div>
  ) : (
    <div className="w-full space-y-2">
      {renderCalendarButtons()}
      {creditedServices.length > 0 ? (
        <Button className="w-full" onClick={resetEverything}>
          Schedule more
        </Button>
      ) : null}
      <Button
        className="w-full"
        variant={creditedServices.length > 0 ? 'ghost' : 'default'}
        onClick={() => (onDone ? onDone() : navigate('/'))}
      >
        Done
      </Button>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className={cn('space-y-8')}>
        <div className="flex flex-col items-center gap-1">
          <H2>You’re officially underway.</H2>
          <Body1 className="max-w-[352px] text-center text-secondary">
            We’ll guide you through every step and tell you exactly what to do
            next.
          </Body1>
        </div>
        <div className="relative -mx-6 flex items-center justify-center overflow-hidden rounded-2xl px-12 py-14 md:-mx-16">
          <img
            src="/scheduling/running-woman.webp"
            alt=""
            className="absolute inset-0 size-full object-cover object-bottom"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-zinc-50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-50 to-transparent" />
          <div className="relative z-10 flex w-full max-w-[352px] flex-col justify-center gap-4">
            <div className="rounded-[20px] border bg-white p-4 shadow-sm">
              <AnimatedTimeline timeline={timelineSteps} />
            </div>
            {mode !== 'test-kit' ? (
              <Body3 className="text-center text-secondary">
                Invites are sent to{' '}
                <span className="text-primary">{user?.email}</span>. Otherwise
                add the event to your calendar below.
              </Body3>
            ) : null}
          </div>
        </div>
      </div>
      <ScheduleFlowFooter prevBtn={null} nextBtn={nextBtn} />
    </div>
  );
};
