import { google, ics } from 'calendar-link';
import { ChevronDown } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Body1, Body3 } from '@/components/ui/typography';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  SUPERPOWER_ADVANCED_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { Address, CollectionMethodType, Slot } from '@/types/api';

import { getCalendarEvent } from '../add-to-calendar-button/utils/get-calendar-event';

export function AddToCalendar({
  slot,
  address,
  collectionMethod,
  service,
}: {
  slot: Slot;
  address: Address;
  collectionMethod: CollectionMethodType;
  service:
    | typeof SUPERPOWER_BLOOD_PANEL
    | typeof GRAIL_GALLERI_MULTI_CANCER_TEST
    | typeof SUPERPOWER_ADVANCED_BLOOD_PANEL;
}) {
  const event = getCalendarEvent({ slot, address, collectionMethod, service });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="small" variant="outline" className="gap-2">
          <Body1 className="text-zinc-900">Add to calendar</Body1>
          <ChevronDown size={18} color="#A1A1AA" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[99999] rounded-xl border border-zinc-200 p-0"
        align="end"
      >
        <div className="flex flex-col p-2">
          <Body3 className="p-2 pb-3 text-zinc-400">
            Invites are sent by default, if you didn&apos;t get one you can add
            it using links below
          </Body3>
          <a
            href={ics(event)}
            target="_blank"
            className="flex gap-3 rounded-xl px-3 py-4 text-base text-zinc-600 hover:cursor-pointer hover:bg-zinc-50"
            rel="noreferrer"
          >
            <img
              className="size-6 object-cover"
              src="/onboarding/calendar-ios.svg"
              alt="calendar-ios"
            />
            Apple calendar
          </a>
          <a
            href={google(event)}
            target="_blank"
            className="flex gap-3 rounded-xl px-3 py-4 text-base text-zinc-600 hover:cursor-pointer hover:bg-zinc-50"
            rel="noreferrer"
          >
            <img
              className="size-6 object-cover"
              src="/onboarding/calendar-google.svg"
              alt="calendar-ios"
            />
            Google calendar
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
