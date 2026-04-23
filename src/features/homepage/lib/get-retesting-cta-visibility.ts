import { type Credit, OrderStatus, type RequestGroup } from '@/types/api';

const RETESTING_ELIGIBILITY_MS = 1000 * 60 * 60 * 24 * 60;

interface RetestingCtaVisibilityInput {
  nowMs: number;
  requestGroups: RequestGroup[];
  credits: Credit[];
  phlebotomyServiceIds: string[];
}

export function getRetestingCtaVisibility(input: RetestingCtaVisibilityInput) {
  const phlebotomyServiceIds = new Set(input.phlebotomyServiceIds);

  for (const credit of input.credits) {
    if (!phlebotomyServiceIds.has(credit.serviceId)) continue;

    return false;
  }

  let latestCompletedMs: number | null = null;
  for (const requestGroup of input.requestGroups) {
    if (requestGroup.status !== OrderStatus.completed) continue;
    if (
      requestGroup.collectionMethod != null &&
      requestGroup.collectionMethod !== 'IN_LAB'
    ) {
      continue;
    }

    const timestamp =
      requestGroup.endTimestamp ??
      requestGroup.startTimestamp ??
      requestGroup.createdAt;
    if (timestamp == null) continue;

    const parsedMs = new Date(timestamp).getTime();
    if (Number.isNaN(parsedMs)) continue;
    if (latestCompletedMs == null || parsedMs > latestCompletedMs) {
      latestCompletedMs = parsedMs;
    }
  }

  return (
    latestCompletedMs != null &&
    input.nowMs - latestCompletedMs > RETESTING_ELIGIBILITY_MS
  );
}
