import { useNavigate } from 'react-router-dom';

import {
  AppleCalendarButton,
  GoogleCalendarButton,
} from '@/components/shared/add-to-calendar-button';
import { AnimatedTimeline } from '@/components/ui/animated-timeline';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body3, H2 } from '@/components/ui/typography';
import { useCredits } from '@/features/orders/api/credits';
import { SHARED_CONTAINER_STYLE } from '@/features/orders/const/config';
import { useServices } from '@/features/services/api';
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

  const resetEverything = () => {
    resetStore();
    resetSteps();
  };

  const timelineSteps = getTimeline(collectionMethod ?? undefined, mode);
  const { data: user, isLoading } = useUser();

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
        <Body3 className="text-zinc-400">
          Invites are sent automatically. Otherwise add the event to your
          calendar below.
        </Body3>
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

  return (
    <>
      <div className={cn('space-y-8', SHARED_CONTAINER_STYLE)}>
        <div className="space-y-1">
          <H2>Thank you, {user?.firstName}</H2>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Body1 className="text-secondary">
              You will receive an email to {user?.email} for additional testing
              details.
            </Body1>
          )}
        </div>
        <AnimatedTimeline timeline={timelineSteps} />
      </div>
      <ScheduleFlowFooter
        prevBtn={null}
        nextBtn={
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
        }
      />
    </>
  );
};
