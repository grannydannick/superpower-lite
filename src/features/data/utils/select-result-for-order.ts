import { Biomarker, BiomarkerResult } from '@/types/api';

/**
 * Returns the BiomarkerResult that best matches the selected order/date filter.
 * - First tries exact `orderId` match
 * - Otherwise returns the closest value within ±1 day of `selectedOrderDate`
 */
export function selectResultForOrder(
  biomarker: Biomarker,
  selectedOrderId?: string,
  selectedOrderDate?: Date | null,
): BiomarkerResult | undefined {
  if (!selectedOrderId && !selectedOrderDate) return undefined;

  const values = biomarker.value || [];
  if (selectedOrderId) {
    const exact = values.find((v) => v.orderId === selectedOrderId);
    if (exact) return exact;
  }

  if (!selectedOrderDate) return undefined;

  const oneDayInMs = 24 * 60 * 60 * 1000;
  let best: BiomarkerResult | undefined;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const v of values) {
    const d = Math.abs(
      new Date(v.timestamp).getTime() - selectedOrderDate.getTime(),
    );
    if (d <= oneDayInMs && d < bestDiff) {
      best = v;
      bestDiff = d;
    }
  }

  return best;
}
