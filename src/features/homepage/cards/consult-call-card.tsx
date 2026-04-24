import { TZDateMini } from '@date-fns/tz';
import { format } from 'date-fns';
import { Phone, Video } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2 } from '@/components/ui/typography';
import { useCancelConsult, useConsults } from '@/features/consults/api';
import { HomepageCard } from '@/features/homepage/components/homepage-card';
import { BookingSummary } from '@/types/api';
import { resolveTimeZone } from '@/utils/timezone';

export const ConsultCallCard = () => {
  const { data } = useConsults();
  const bookings = data?.bookings ?? [];

  const now = new Date();
  const upcoming = bookings.find(
    (b) => b.status === 'booked' && new Date(b.end) > now,
  );

  if (!upcoming) return null;

  return <ConsultCallCardContent booking={upcoming} />;
};

function ConsultCallCardContent({ booking }: { booking: BookingSummary }) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const cancelMutation = useCancelConsult({});

  const tz = resolveTimeZone(undefined);
  const startDate = new TZDateMini(booking.start, tz);
  const endDate = new TZDateMini(booking.end, tz);

  const now = new Date();
  const isInProgress =
    new Date(booking.start) <= now && new Date(booking.end) > now;

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ uid: booking.calBookingUid });
    setShowCancelConfirm(false);
  };

  if (showCancelConfirm) {
    return (
      <HomepageCard>
        <div className="space-y-4">
          <div className="space-y-1">
            <Body1 className="font-medium">
              Cancel your complimentary call?
            </Body1>
            <Body2 className="text-secondary">
              You can always schedule a new one from the consults page.
            </Body2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="small"
              className="flex-1"
              onClick={() => setShowCancelConfirm(false)}
              disabled={cancelMutation.isPending}
            >
              Go back
            </Button>
            <Button
              size="small"
              className="flex-1"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <TransactionSpinner size="sm" />
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </div>
      </HomepageCard>
    );
  }

  return (
    <HomepageCard>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-vermillion-100">
              <Phone className="size-5 text-vermillion-900" />
            </div>
            <div>
              <Body1 className="font-medium">Your call is booked</Body1>
              <Body2 className="text-secondary">
                Superpower 1:1 Complimentary Call
              </Body2>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-zinc-50 px-4 py-3">
          <Body1 className="font-medium">
            {format(startDate, 'EEEE, MMM do, yyyy')}
          </Body1>
          <Body2 className="text-secondary">
            {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')} ({tz})
          </Body2>
        </div>

        {booking.meetingUrl ? (
          <a
            href={booking.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              className={`w-full ${isInProgress ? 'animate-pulse bg-emerald-600 hover:bg-emerald-700' : ''}`}
            >
              <Video className="mr-1.5 size-4" />
              {isInProgress ? 'Join call now' : 'Join call'}
            </Button>
          </a>
        ) : null}

        <Button
          variant="outline"
          size="small"
          className="w-full"
          onClick={() => setShowCancelConfirm(true)}
        >
          Cancel appointment
        </Button>
      </div>
    </HomepageCard>
  );
}
