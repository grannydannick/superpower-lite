import { google, ics } from 'calendar-link';
import { ChevronDown } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Body2, Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { Address, CollectionMethodType, Slot } from '@/types/api';

import { getCalendarEvent } from '../add-to-calendar-button/utils/get-calendar-event';

export function AddToCalendar({
  slot,
  address,
  collectionMethod,
  className,
  variant = 'button',
}: {
  slot: Slot;
  address: Address;
  collectionMethod: CollectionMethodType;
  className?: string;
  variant?: 'vermillion' | 'button'; // decides whether to use a orange text as a dropdown, or the default button variant
}) {
  const event = getCalendarEvent({
    slot,
    address,
    collectionMethod,
  });

  if (!event) return;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant === 'button' ? 'outline' : 'ghost'}
          className={cn(
            'gap-1 group',
            variant === 'vermillion'
              ? 'px-0 py-0 hover:opacity-75 transition-all duration-200'
              : '',
            className,
          )}
        >
          <Body2
            className={cn(
              variant === 'vermillion'
                ? 'text-vermillion-900'
                : 'text-zinc-900',
            )}
          >
            Add to calendar
          </Body2>
          <ChevronDown
            size={15}
            className="transition-all duration-200 ease-out group-data-[state=open]:-rotate-180"
            color={variant === 'vermillion' ? '#fc5f2b' : '#A1A1AA'}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[99999] rounded-[20px] border border-zinc-200 p-0"
        align="start"
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
              src="/onboarding/shared/calendar/calendar-ios.svg"
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
              src="/onboarding/shared/calendar/calendar-google.svg"
              alt="calendar-ios"
            />
            Google calendar
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
