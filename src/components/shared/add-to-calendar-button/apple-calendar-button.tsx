import { ics } from 'calendar-link';
import React from 'react';

import { getCalendarEvent } from '@/components/shared/add-to-calendar-button/utils/get-calendar-event';
import { cn } from '@/lib/utils';
import { Address, CollectionMethodType, Slot } from '@/types/api';

export function AppleCalendarButton({
  slot,
  address,
  collectionMethod,
  className,
}: {
  slot: Slot;
  address: Address;
  collectionMethod: CollectionMethodType;
  className?: string;
}) {
  const event = getCalendarEvent({
    slot,
    address,
    collectionMethod,
  });

  if (!event) return;

  return (
    <a
      href={ics(event)}
      target="_blank"
      className={cn(
        'flex gap-3 rounded-xl px-5 py-3.5 text-base text-zinc-500 hover:cursor-pointer hover:bg-zinc-50',
        className,
      )}
      rel="noreferrer"
    >
      <img
        className="size-6 object-contain"
        src="/apple-logo.svg"
        alt="calendar-ios"
      />
      Add to Apple Calendar
    </a>
  );
}
