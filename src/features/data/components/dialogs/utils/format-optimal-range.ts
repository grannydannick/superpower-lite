export const formatOptimalRange = (range: any) => {
  const hasLow = range?.low?.value !== undefined && range?.low?.value !== null;

  const hasHigh =
    range?.high?.value !== undefined && range?.high?.value !== null;

  if (hasLow && hasHigh) {
    return {
      type: 'range',
      lowValue: range.low.value,
      highValue: range.high.value,
    };
  }

  if (hasLow && !hasHigh) {
    const symbol = range.low.comparator === 'GREATER_THAN_EQUALS' ? '≥' : '>';
    return {
      type: 'single',
      symbol,
      value: range.low.value,
    };
  }

  if (!hasLow && hasHigh) {
    const symbol = range.high.comparator === 'LESS_THAN_EQUALS' ? '≤' : '<';
    return {
      type: 'single',
      symbol,
      value: range.high.value,
    };
  }

  return { type: 'none' };
};
