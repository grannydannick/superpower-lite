import { TZDateMini } from '@date-fns/tz';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { CalendarCheck, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

import { DotIcon } from '@/components/icons/dot';
import { AppointmentScheduler } from '@/components/shared/scheduler';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H2, H3 } from '@/components/ui/typography';
import { ConsultSlot } from '@/types/api';
import { resolveTimeZone } from '@/utils/timezone';

import { useCreateConsult } from '../api';

type FlowMode = 'schedule' | 'confirm' | 'success';

export function NewConsultFlow() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<FlowMode>('schedule');
  const [selectedSlot, setSelectedSlot] = useState<ConsultSlot | null>(null);
  const [selectedTz, setSelectedTz] = useState<string>(
    resolveTimeZone(undefined),
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const bookingMutation = useCreateConsult({});

  const handleSlotUpdate = (slot: ConsultSlot | null, tz: string) => {
    setSelectedSlot(slot);
    setSelectedTz(tz);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;

    setIsProcessing(true);

    try {
      await bookingMutation.mutateAsync({
        data: {
          start: selectedSlot.start,
          practitionerId: selectedSlot.practitionerId,
        },
      });

      setMode('success');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 lg:px-0">
      <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-4">
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

      {mode === 'schedule' && (
        <>
          <ConsultInfoCard />
          <div className="mt-8">
            <AppointmentScheduler
              onSlotUpdate={handleSlotUpdate}
              selectedSlot={selectedSlot}
            />
          </div>
          <div className="mt-8 flex items-center gap-4 md:justify-end">
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => void navigate({ to: '/consults' })}
            >
              Cancel
            </Button>
            <Button
              className="w-full md:w-auto"
              disabled={!selectedSlot}
              onClick={() => setMode('confirm')}
            >
              Continue
            </Button>
          </div>
        </>
      )}

      {mode === 'confirm' && (
        <>
          <div className="space-y-8">
            <div className="space-y-1">
              <H2>Confirm appointment</H2>
              <Body1 className="text-secondary">
                Confirm your appointment details below.
              </Body1>
            </div>

            <div className="flex flex-col rounded-[20px] border border-zinc-200 bg-white px-5 py-3 shadow shadow-black/[.03]">
              <div className="flex items-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-xl bg-vermillion-50">
                  <CalendarCheck className="size-7 text-vermillion-900" />
                </div>
                <div className="space-y-0.5">
                  <Body1>Superpower 1:1 Complimentary Call</Body1>
                  <Body2 className="text-zinc-400">
                    Video call with{' '}
                    {selectedSlot?.practitionerName ?? 'your care team'}
                  </Body2>
                </div>
              </div>
            </div>

            {selectedSlot ? (
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
                        {format(
                          new TZDateMini(selectedSlot.start, selectedTz),
                          'MMM do, yyyy',
                        )}
                      </Body1>
                      <DotIcon
                        fill="currentColor"
                        className="hidden text-zinc-300 sm:block"
                      />
                      <Body1 className="text-secondary">
                        {format(
                          new TZDateMini(selectedSlot.start, selectedTz),
                          'h:mmaaa',
                        )}
                        -{' '}
                        {format(
                          new TZDateMini(selectedSlot.end, selectedTz),
                          'h:mmaaa',
                        )}{' '}
                        ({selectedTz})
                      </Body1>
                    </div>
                    <Body2 className="mt-3 text-zinc-400">
                      You'll receive a calendar invite at the email address
                      linked to your Superpower account. That invite will
                      include the video call link. You do not need to join
                      through the Superpower app.
                    </Body2>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex items-center gap-4 md:justify-end">
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => setMode('schedule')}
            >
              Back
            </Button>
            <Button
              className="w-full md:w-auto"
              onClick={handleConfirm}
              disabled={bookingMutation.isPending || isProcessing}
            >
              {bookingMutation.isPending || isProcessing ? (
                <TransactionSpinner size="sm" />
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </>
      )}

      {mode === 'success' && (
        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-1">
              <H2>Appointment booked!</H2>
              <Body1 className="w-full text-center text-secondary">
                Your Rx consult has been successfully scheduled
                {selectedSlot?.practitionerName
                  ? ` with ${selectedSlot.practitionerName}`
                  : ''}
                .
              </Body1>
            </div>

            {selectedSlot ? (
              <div className="mx-auto w-full rounded-[20px] border bg-white p-5 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-vermillion-50">
                      <CalendarCheck className="size-6 text-vermillion-900" />
                    </div>
                    <div className="space-y-0.5">
                      <Body1 className="font-medium">
                        Superpower 1:1 Rx Consult
                      </Body1>
                      <Body2 className="text-zinc-400">Video call</Body2>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Body2 className="text-secondary">
                      {format(
                        new TZDateMini(selectedSlot.start, selectedTz),
                        'EEEE, MMM do, yyyy',
                      )}
                    </Body2>
                    <Body2 className="text-secondary">
                      {format(
                        new TZDateMini(selectedSlot.start, selectedTz),
                        'h:mm a',
                      )}{' '}
                      -{' '}
                      {format(
                        new TZDateMini(selectedSlot.end, selectedTz),
                        'h:mm a',
                      )}{' '}
                      ({selectedTz})
                    </Body2>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              className="w-full"
              onClick={() => void navigate({ to: '/consults' })}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConsultInfoCard() {
  return (
    <div className="flex gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow shadow-black/[.03]">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-vermillion-50">
        <CalendarCheck className="size-6 text-vermillion-900" />
      </div>
      <div className="space-y-2">
        <div>
          <Body1 className="font-medium">
            Superpower 1:1 Complimentary Call
          </Body1>
          <Body2 className="text-zinc-400">
            A complimentary 1:1 call with your care team to discuss prescription
            treatment options.
          </Body2>
        </div>
        <Body2 className="text-zinc-400">
          <span className="font-medium">Disclaimer:</span> This discussion is
          for general information about medications offered by Superpower. For
          care decisions or urgent concerns, please contact your healthcare
          provider.
        </Body2>
      </div>
    </div>
  );
}
