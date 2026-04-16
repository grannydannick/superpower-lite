import { TZDateMini } from '@date-fns/tz';
import { format } from 'date-fns';
import { CalendarCheck, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

import { Link } from '@/components/ui/link';
import { Body1, Body2, H2, H3 } from '@/components/ui/typography';
import { RedrawRescheduleFlow } from '@/features/redraw/components/redraw-reschedule-flow';
import { getScheduledRedrawOrder } from '@/features/redraw/utils/get-scheduled-redraw-order';
import { PhlebotomyLocation, RequestGroup, Slot } from '@/types/api';

import { RescheduleConfirmation } from './reschedule-confirmation';
import { RescheduleDetails } from './reschedule-details';
import { HealthcareServiceRescheduleFooter } from './reschedule-flow-footer';
import { RescheduleMode } from './reschedule-mode';
import { RescheduleSlotPicker } from './reschedule-slot-picker';

export const RescheduleFlow = ({
  requestGroup,
}: {
  requestGroup: RequestGroup;
}) => {
  const [mode, setMode] = useState<RescheduleMode>('default');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedTz, setSelectedTz] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<PhlebotomyLocation | null>(null);

  const scheduledRedrawOrder = getScheduledRedrawOrder(requestGroup);

  if (scheduledRedrawOrder) {
    return <RedrawRescheduleFlow requestGroup={requestGroup} />;
  }

  let content = null;

  switch (mode) {
    case 'default':
      content = (
        <RescheduleDetails requestGroup={requestGroup} setMode={setMode} />
      );
      break;
    case 'cancel':
      content = (
        <RescheduleConfirmation requestGroup={requestGroup} mode={mode} />
      );
      break;
    case 'reschedule':
      content = (
        <RescheduleSlotPicker
          requestGroup={requestGroup}
          selectedSlot={selectedSlot}
          selectedLocation={selectedLocation}
          onSlotSelected={setSelectedSlot}
          onLocationSelected={setSelectedLocation}
          onTzSelected={setSelectedTz}
        />
      );
      break;
    case 'reschedule-confirm':
      content = (
        <RescheduleConfirmSummary
          requestGroup={requestGroup}
          selectedSlot={selectedSlot}
          selectedTz={selectedTz}
          selectedLocation={selectedLocation}
        />
      );
      break;
    case 'reschedule-success':
      content = (
        <RescheduleSuccess
          selectedSlot={selectedSlot}
          selectedTz={selectedTz}
          selectedLocation={selectedLocation}
        />
      );
      break;
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-4">
        <Link
          to="/orders"
          className="group -ml-1.5 flex items-center gap-0.5 p-0"
        >
          <ChevronLeft className="-mt-px w-[15px] text-zinc-400 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-zinc-600" />
          <Body2 className="text-zinc-500 transition-all duration-150 group-hover:text-zinc-700">
            Back
          </Body2>
        </Link>
      </div>
      {content}
      <HealthcareServiceRescheduleFooter
        requestGroup={requestGroup}
        mode={mode}
        setMode={setMode}
        selectedSlot={selectedSlot}
        selectedLocation={selectedLocation}
      />
    </div>
  );
};

const RescheduleConfirmSummary = ({
  requestGroup,
  selectedSlot,
  selectedTz,
  selectedLocation,
}: {
  requestGroup: RequestGroup;
  selectedSlot: Slot | null;
  selectedTz: string | null;
  selectedLocation: PhlebotomyLocation | null;
}) => {
  return (
    <div className="flex flex-col justify-center gap-4 px-4 md:max-w-none">
      <div className="max-w-[320px] space-y-4 md:max-w-none">
        <H2 className="text-zinc-900">Confirm your new appointment</H2>
      </div>
      {selectedSlot && selectedTz ? (
        <div className="border-vermillion-400 space-y-3 rounded-2xl border-2 bg-vermillion-50 p-6">
          <Body2 className="text-vermillion-900">New appointment time</Body2>
          <Body1 className="font-medium">
            {format(
              new TZDateMini(selectedSlot.start, selectedTz),
              'EEEE, MMMM do, yyyy',
            )}
          </Body1>
          <Body1 className="text-secondary">
            {format(new TZDateMini(selectedSlot.start, selectedTz), 'h:mm a')} -{' '}
            {format(new TZDateMini(selectedSlot.end, selectedTz), 'h:mm a')}
            {` (${selectedTz})`}
          </Body1>
          {selectedLocation?.address ? (
            <div className="border-vermillion-200 mt-2 border-t pt-3">
              <Body2 className="text-vermillion-900">Location</Body2>
              <Body1 className="mt-1">
                {selectedLocation.name ? `${selectedLocation.name} — ` : ''}
                {selectedLocation.address.line.join(' ')}
              </Body1>
              <Body1 className="text-secondary">
                {selectedLocation.address.city},{' '}
                {selectedLocation.address.state}{' '}
                {selectedLocation.address.postalCode}
              </Body1>
            </div>
          ) : null}
        </div>
      ) : null}
      {requestGroup.startTimestamp && requestGroup.timezone ? (
        <div className="space-y-3 rounded-2xl border p-6">
          <Body2 className="text-secondary">Current appointment</Body2>
          <Body1 className="text-zinc-500 line-through">
            {format(
              new TZDateMini(
                requestGroup.startTimestamp,
                requestGroup.timezone,
              ),
              'EEEE, MMMM do, yyyy',
            )}
          </Body1>
          <Body1 className="text-zinc-400 line-through">
            {format(
              new TZDateMini(
                requestGroup.startTimestamp,
                requestGroup.timezone,
              ),
              'h:mm a',
            )}
            {requestGroup.endTimestamp
              ? ` - ${format(new TZDateMini(requestGroup.endTimestamp, requestGroup.timezone), 'h:mm a')}`
              : ''}
            {` (${requestGroup.timezone})`}
          </Body1>
        </div>
      ) : null}
    </div>
  );
};

const RescheduleSuccess = ({
  selectedSlot,
  selectedTz,
  selectedLocation,
}: {
  selectedSlot: Slot | null;
  selectedTz: string | null;
  selectedLocation: PhlebotomyLocation | null;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-12 text-center md:max-w-none">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
        <CalendarCheck className="size-8 text-emerald-600" />
      </div>
      <div className="space-y-2">
        <H2 className="text-zinc-900">Appointment rescheduled</H2>
        <Body1 className="text-secondary">
          Your appointment has been successfully rescheduled.
        </Body1>
      </div>
      {selectedSlot && selectedTz ? (
        <div className="w-full max-w-md space-y-3 rounded-2xl border p-6 text-left">
          <Body2 className="text-secondary">Your new appointment</Body2>
          <H3>
            {format(
              new TZDateMini(selectedSlot.start, selectedTz),
              'EEEE, MMMM do, yyyy',
            )}
          </H3>
          <Body1 className="text-secondary">
            {format(new TZDateMini(selectedSlot.start, selectedTz), 'h:mm a')} -{' '}
            {format(new TZDateMini(selectedSlot.end, selectedTz), 'h:mm a')}
            {` (${selectedTz})`}
          </Body1>
          {selectedLocation?.address ? (
            <div className="mt-2 border-t pt-3">
              <Body2 className="text-secondary">Location</Body2>
              <Body1 className="mt-1">
                {selectedLocation.name ? `${selectedLocation.name} — ` : ''}
                {selectedLocation.address.line.join(' ')}
              </Body1>
              <Body1 className="text-secondary">
                {selectedLocation.address.city},{' '}
                {selectedLocation.address.state}{' '}
                {selectedLocation.address.postalCode}
              </Body1>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
