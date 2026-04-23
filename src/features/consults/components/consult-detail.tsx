import { TZDateMini } from '@date-fns/tz';
import { useNavigate, useParams } from '@tanstack/react-router';
import { format } from 'date-fns';
import { CalendarCheck, CalendarX, ChevronLeft, Video } from 'lucide-react';
import { useState } from 'react';

import { DotIcon } from '@/components/icons/dot';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H2, H3 } from '@/components/ui/typography';
import { resolveTimeZone } from '@/utils/timezone';

import { useCancelConsult, useConsults } from '../api';

type DetailMode = 'view' | 'cancel-confirm';

export function ConsultDetail() {
  const { uid } = useParams({ strict: false }) as { uid: string };
  const navigate = useNavigate();
  const [mode, setMode] = useState<DetailMode>('view');

  const { data, isLoading } = useConsults();
  const cancelMutation = useCancelConsult({});

  const booking = data?.bookings?.find((b) => b.calBookingUid === uid);
  const tz = resolveTimeZone(undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-8 lg:px-0">
        <Body1 className="text-center text-secondary">
          Appointment not found.
        </Body1>
      </div>
    );
  }

  const isPast = new Date(booking.end) < new Date();
  const isCancelled = booking.status === 'cancelled';
  const canCancel = !isPast && !isCancelled;

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ uid: booking.calBookingUid });
    void navigate({ to: '/consults' });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 lg:px-0">
      <div className="mb-6">
        <Link
          to="/consults"
          className="group -ml-1.5 flex items-center gap-0.5 p-0"
        >
          <ChevronLeft className="-mt-px w-[15px] text-zinc-400 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-zinc-600" />
          <Body2 className="text-zinc-500 transition-all duration-150 group-hover:text-zinc-700">
            Back
          </Body2>
        </Link>
      </div>

      {mode === 'view' && (
        <div className="space-y-8">
          <div className="space-y-1">
            <H2>Superpower 1:1 Rx Consult</H2>
            <Body1 className="text-secondary">
              {isCancelled
                ? 'This appointment has been cancelled.'
                : isPast
                  ? 'This appointment has been completed.'
                  : 'Your upcoming Rx consult appointment.'}
            </Body1>
          </div>

          <div className="flex flex-col rounded-[20px] border border-zinc-200 bg-white px-5 py-4 shadow shadow-black/[.03]">
            <div className="flex items-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-xl bg-vermillion-50">
                <CalendarCheck className="size-7 text-vermillion-900" />
              </div>
              <div className="space-y-0.5">
                <Body1 className="font-medium">Superpower 1:1 Rx Consult</Body1>
                <Body2 className="text-zinc-400">Video call</Body2>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <H3>Appointment details</H3>
            <div className="flex gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-vermillion-100">
                <CalendarCheck className="size-4 text-vermillion-900" />
              </div>
              <div className="space-y-2">
                <Body1>Video appointment</Body1>
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                  <Body1 className="text-secondary">
                    {format(new TZDateMini(booking.start, tz), 'MMM do, yyyy')}
                  </Body1>
                  <DotIcon
                    fill="currentColor"
                    className="hidden text-zinc-300 sm:block"
                  />
                  <Body1 className="text-secondary">
                    {format(new TZDateMini(booking.start, tz), 'h:mmaaa')} -{' '}
                    {format(new TZDateMini(booking.end, tz), 'h:mmaaa')} ({tz})
                  </Body1>
                </div>
              </div>
            </div>

            {booking.meetingUrl && !isPast && !isCancelled ? (
              <div className="flex gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-vermillion-100">
                  <Video className="size-4 text-vermillion-900" />
                </div>
                <div className="space-y-2">
                  <Body1>Meeting link</Body1>
                  <a
                    href={booking.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-vermillion-900 transition-all duration-200 hover:opacity-75"
                  >
                    Join video call
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          {canCancel ? (
            <div className="flex items-center gap-4 md:justify-end">
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setMode('cancel-confirm')}
              >
                <CalendarX className="mr-1.5 size-4" />
                Cancel appointment
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {mode === 'cancel-confirm' && (
        <div className="space-y-8">
          <div className="space-y-1">
            <H2>Cancel appointment?</H2>
            <Body1 className="text-secondary">
              Are you sure you want to cancel this appointment? You can always
              schedule a new one.
            </Body1>
          </div>

          <div className="flex flex-col rounded-[20px] border border-zinc-200 bg-white px-5 py-4 shadow shadow-black/[.03]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-vermillion-50">
                  <CalendarCheck className="size-6 text-vermillion-900" />
                </div>
                <div className="space-y-0.5">
                  <Body1 className="font-medium">
                    Superpower 1:1 Rx Consult
                  </Body1>
                  <Body2 className="text-zinc-400">
                    {format(new TZDateMini(booking.start, tz), 'MMM do, yyyy')}{' '}
                    at {format(new TZDateMini(booking.start, tz), 'h:mm a')}
                  </Body2>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:justify-end">
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => setMode('view')}
            >
              Go back
            </Button>
            <Button
              className="w-full md:w-auto"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <TransactionSpinner size="sm" />
              ) : (
                'Confirm cancellation'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
