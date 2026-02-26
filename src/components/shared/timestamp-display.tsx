import { TZDateMini, tzName } from '@date-fns/tz';
import { format } from 'date-fns';
import React from 'react';

import { resolveTimeZone } from '@/utils/timezone';

export interface TimestampDisplayProps {
  timestamp: Date;
  timezone?: string;
  dayOnly?: boolean;
}

export function TimestampDisplay({
  timestamp,
  timezone,
  dayOnly = false,
}: TimestampDisplayProps) {
  if (timestamp == null) return <></>;

  const timeZone = resolveTimeZone(timezone);
  const dateInTz = new TZDateMini(timestamp.getTime(), timeZone);

  return (
    <span className="flex">
      <span className="line-clamp-1">{format(dateInTz, 'MMM d, yyyy')}</span>
      {!dayOnly && (
        <>
          <svg
            className={`mx-1.5 w-1 fill-slate-400`}
            viewBox="0 0 2 2"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          <span className="line-clamp-1">
            {format(dateInTz, 'h:mm aaa')} {tzName(timeZone, dateInTz, 'short')}
          </span>
        </>
      )}
    </span>
  );
}
