import {
  AppleCalendarButton,
  GoogleCalendarButton,
} from '@/components/shared/add-to-calendar-button';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body3, H2 } from '@/components/ui/typography';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE } from '@/features/orders/const/config';
import { useOrder } from '@/features/orders/stores/order-store';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { getServiceTimeline } from '@/utils/service';
import { AnimatedTimeline } from 'src/components/ui/animated-timeline';

export const Success = () => {
  const { slot, service, collectionMethod, location } = useOrder((s) => s);
  const timelineSteps = getServiceTimeline(service, collectionMethod);
  const { data: user, isLoading } = useUser();

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
    if (!service.supportsLabOrder) {
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
          serviceName={service.name}
          collectionMethod={collectionMethod}
          className="justify-center border border-zinc-100 bg-white shadow shadow-black/[.02] transition-all duration-200"
        />
        <GoogleCalendarButton
          address={location.address}
          slot={slot}
          serviceName={service.name}
          collectionMethod={collectionMethod}
          className="justify-center border border-zinc-100 bg-white shadow shadow-black/[.02] transition-all duration-200"
        />
      </>
    );
  };

  return (
    <>
      <div
        className={cn('space-y-8', HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE)}
      >
        <div className="space-y-1">
          <H2 className="text-zinc-900">
            Thank you, we look forward to seeing you shortly.
          </H2>
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
      <HealthcareServiceFooter
        prevBtn={null}
        nextBtn={
          <div className="w-full space-y-2">
            {renderCalendarButtons()}
            <DialogClose asChild>
              <Button className="w-full">Done</Button>
            </DialogClose>
          </div>
        }
      />
    </>
  );
};
