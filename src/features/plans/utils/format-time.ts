const TIME_UNIT_DISPLAY = {
  s: 'second',
  min: 'minute',
  h: 'hour',
  d: 'day',
  wk: 'week',
  mo: 'month',
  a: 'year',
} as const;

export const formatTime = (
  repeatTiming?: { frequency?: number; period?: number; periodUnit?: string },
  scheduledDate?: string,
  scheduledEvents?: string[],
  isProduct?: boolean,
) => {
  if (isProduct && repeatTiming?.periodUnit) {
    const frequency = repeatTiming.frequency ?? repeatTiming.period ?? 1;
    const unit =
      TIME_UNIT_DISPLAY[
        repeatTiming.periodUnit as keyof typeof TIME_UNIT_DISPLAY
      ] ?? repeatTiming.periodUnit;
    return `${frequency} ${frequency === 1 ? 'time' : 'times'} per ${unit}`;
  }

  if (!isProduct && scheduledEvents?.length) {
    return `On ${new Date(scheduledEvents[0]).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })}`;
  }

  if (!isProduct && scheduledDate) {
    return `By ${new Date(scheduledDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }

  return null;
};
