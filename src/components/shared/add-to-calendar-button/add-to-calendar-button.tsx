import { google, ics } from 'calendar-link';
import { ChevronDown } from 'lucide-react';
import React from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Body1, Body3 } from '@/components/ui/typography';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
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
    | typeof GRAIL_GALLERI_MULTI_CANCER_TEST;
}) {
  const event = getCalendarEvent({ slot, address, collectionMethod, service });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex w-full max-w-[244px] cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-[18px] py-4">
          <Body1 className="text-zinc-900">Add to calendar</Body1>
          <ChevronDown size={24} color="#A1A1AA" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="z-[99999] rounded-xl border border-zinc-200 p-2">
        <div className="flex flex-col gap-4 p-2">
          <Body3 className="p-2 text-zinc-400">
            Invites are sent by default, if you didn&apos;t get one you can add
            it using links below
          </Body3>
          <div className="flex gap-3 rounded-xl px-3 py-4 hover:cursor-pointer hover:bg-[#F7F7F7]">
            <img
              className="size-6 object-cover"
              src="/onboarding/calendar-ios.svg"
              alt="calendar-ios"
            />
            <a
              href={ics(event)}
              target="_blank"
              className="text-base text-zinc-600"
              rel="noreferrer"
            >
              Apple calendar
            </a>
          </div>
          <div className="flex gap-3 rounded-xl px-3 py-4 hover:cursor-pointer hover:bg-[#F7F7F7]">
            <img
              className="size-6 object-cover"
              src="/onboarding/calendar-google.svg"
              alt="calendar-ios"
            />
            <a
              href={google(event)}
              target="_blank"
              className="text-base text-zinc-600"
              rel="noreferrer"
            >
              Google calendar
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
