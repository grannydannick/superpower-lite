import React from 'react';
import {
  InlineWidget,
  useCalendlyEventListener,
  EventScheduledEvent,
} from 'react-calendly';

import { CalendlyScheduledEventInfo } from '@/types/calendly';
import { formatPhoneNumber } from '@/utils/format';

export interface CalendlySchedulerProps {
  token: string;
  url: string;
  onComplete: (data: CalendlyScheduledEventInfo) => void;
  autoFill: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export function CalendlyScheduler(props: CalendlySchedulerProps): JSX.Element {
  const { token, url, onComplete, autoFill } = props;

  const getScheduledEventInfo = async (
    uri: string,
    token: string,
  ): Promise<{ resource: CalendlyScheduledEventInfo }> => {
    return await fetch(uri, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((result) => {
      if (result.ok) {
        return result.json();
      }
      throw Error('No event data provided.');
    });
  };

  const onEventScheduled = (e: EventScheduledEvent): void => {
    if (e.data.event !== 'calendly.event_scheduled') return;

    getScheduledEventInfo(e.data.payload.event.uri, token)
      .then((info: { resource: CalendlyScheduledEventInfo }) => {
        if (!info) return;

        onComplete(info?.resource);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useCalendlyEventListener({
    onEventScheduled: onEventScheduled,
  });

  return (
    <>
      <InlineWidget
        url={url}
        styles={{
          width: '100%',
          height: 500,
        }}
        prefill={{
          name: `${autoFill.firstName} ${autoFill.lastName}`,
          email: `${autoFill.email}`,
          customAnswers: {
            a1: `${formatPhoneNumber(autoFill.phoneNumber)}`,
          },
        }}
      />
    </>
  );
}
