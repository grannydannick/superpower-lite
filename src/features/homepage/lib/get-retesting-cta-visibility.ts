import { type Credit, OrderStatus, type RequestGroup } from '@/types/api';

const RETESTING_ELIGIBILITY_MS = 1000 * 60 * 60 * 24 * 60;

interface RetestingCtaVisibilityInput {
  nowMs: number;
  requestGroups: RequestGroup[];
  credits: Credit[];
  phlebotomyServiceIds: string[];
}

export function getRetestingCtaVisibility(input: RetestingCtaVisibilityInput) {
  for (const requestGroup of input.requestGroups) {
    if (requestGroup.status === OrderStatus.active) return false;
  }

  let latestCompletedMs: number | null = null;
  for (const requestGroup of input.requestGroups) {
    if (requestGroup.status !== OrderStatus.completed) continue;

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

  if (latestCompletedMs == null) return false;
  if (input.nowMs - latestCompletedMs <= RETESTING_ELIGIBILITY_MS) {
    return false;
  }
  if (input.credits.length === 0) return true;

  const phlebotomyServiceIds = new Set(input.phlebotomyServiceIds);

  for (const credit of input.credits) {
    if (!phlebotomyServiceIds.has(credit.serviceId)) continue;

    return false;
  }

  return true;
}
