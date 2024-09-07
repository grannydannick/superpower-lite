import moment from 'moment';
import React from 'react';
import 'moment-timezone';

export interface TimestampDisplayProps {
  timestamp: Date;
  timezone?: string;
  dayOnly?: boolean;
}

export function TimestampDisplay({
  timestamp,
  timezone,
  dayOnly = false,
}: TimestampDisplayProps): JSX.Element {
  if (!timestamp) return <></>;

  if (!timezone || !isValidTimeZone(timezone)) {
    timezone = moment.tz.guess();
  }

  return (
    <span className="flex">
      <span className="line-clamp-1">
        {moment(timestamp).tz(timezone).format('MMM D, YYYY')}
      </span>
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
            {moment(timestamp).tz(timezone).format('h:mm a z')}
          </span>
        </>
      )}
    </span>
  );
}

function isValidTimeZone(tz: string) {
  if (!moment) throw Error('MomentJS is not loaded.');

  try {
    const exists = moment.tz.zone(tz);
    return exists !== null;
  } catch (ex) {
    return false;
  }
}
