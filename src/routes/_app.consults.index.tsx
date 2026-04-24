import { TZDateMini } from '@date-fns/tz';
import { Link } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { Calendar, ChevronRight, Plus, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { useConsults } from '@/features/consults/api';
import { BookingSummary } from '@/types/api';
import { resolveTimeZone } from '@/utils/timezone';

export const Route = createFileRoute('/_app/consults/')({
  component: ConsultsComponent,
});

const STATUS_COLORS: Record<string, string> = {
  accepted: 'bg-zinc-100 text-zinc-600',
  pending: 'bg-yellow-100 text-yellow-900',
  cancelled: 'bg-pink-100 text-pink-900',
  rejected: 'bg-pink-100 text-pink-900',
};

function ConsultsComponent() {
  const { data, isLoading } = useConsults();
  const bookings = data?.bookings ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-6 py-9 lg:px-0">
      <div className="flex items-center justify-between">
        <H3>Your consults</H3>
        <Link to="/consults/new">
          <Button size="small">
            <Plus className="mr-1.5 size-4" />
            New consult
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[76px] w-full rounded-2xl" />
          <Skeleton className="h-[76px] w-full rounded-2xl" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-3 py-10">
          <Body1 className="text-center text-secondary">
            No consults yet. Schedule your first complimentary call.
          </Body1>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <ConsultCard key={booking.calBookingUid} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConsultCard({ booking }: { booking: BookingSummary }) {
  const tz = resolveTimeZone(undefined);
  const statusColor =
    STATUS_COLORS[booking.status] ?? 'bg-zinc-100 text-zinc-600';
  const isPast = new Date(booking.end) < new Date();

  return (
    <Link
      to="/consults/$uid"
      params={{ uid: booking.calBookingUid }}
      className="flex w-full items-center justify-between rounded-2xl border p-4 shadow-sm transition-colors hover:bg-zinc-50"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-vermillion-100">
          <Calendar className="size-5 text-vermillion-900" />
        </div>
        <div className="space-y-1 text-left">
          <Body1 className="font-medium">
            Superpower 1:1 Complimentary Call
          </Body1>
          <Body2 className="text-secondary">
            {format(new TZDateMini(booking.start, tz), 'MMM do, yyyy')} at{' '}
            {format(new TZDateMini(booking.start, tz), 'h:mm a')}
          </Body2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {booking.meetingUrl && !isPast ? (
          <a
            href={booking.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex size-8 items-center justify-center rounded-lg bg-vermillion-50 transition-colors hover:bg-vermillion-100"
          >
            <Video className="size-4 text-vermillion-900" />
          </a>
        ) : null}
        <div
          className={`rounded-lg px-2 py-1 text-xs font-medium capitalize ${statusColor}`}
        >
          {isPast && booking.status === 'accepted'
            ? 'completed'
            : booking.status}
        </div>
        <ChevronRight className="size-4 text-zinc-400" />
      </div>
    </Link>
  );
}
