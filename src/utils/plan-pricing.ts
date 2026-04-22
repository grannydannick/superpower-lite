// Shared pricing math for Rx billing plans. The PDP billing-tier selector
// and the in-dashboard plan-change dialog both derive per-month price and
// savings from the same (amount_cents, interval_count_days) shape, so the
// helpers live here to keep currency/math formatting in lockstep between
// the two surfaces.

export const getBillingMonthsFromInterval = (intervalCount: number): number =>
  Math.max(1, Math.round(intervalCount / 30));

export const getPerMonthCents = (
  amountCents: number,
  intervalCount: number,
): number => amountCents / getBillingMonthsFromInterval(intervalCount);

export const formatCentsAsUSD = (cents: number): string => {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
};
