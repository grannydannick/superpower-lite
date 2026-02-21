import moment from 'moment-timezone';
import { useMemo } from 'react';

import { ADVANCED_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL } from '@/const';
import { Credit, RequestGroup } from '@/types/api';

import { useOrders } from '../api';
import { useCredits } from '../api/credits';
import { useScheduleStore } from '../stores/schedule-store';

const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;
const EMPTY_REQUEST_GROUPS: RequestGroup[] = [];
const EMPTY_CREDITS: Credit[] = [];

function normalizeServiceName(name: string): string {
  if (name === SUPERPOWER_BLOOD_PANEL || name === ADVANCED_BLOOD_PANEL)
    return 'BLOOD_PANEL_EQUIV';
  return name;
}

export const useScheduleDuplicate = () => {
  const slot = useScheduleStore((s) => s.slot);
  const selectedCreditIds = useScheduleStore((s) => s.selectedCreditIds);

  const ordersQuery = useOrders();
  const creditsQuery = useCredits();

  const requestGroups = ordersQuery.data?.requestGroups ?? EMPTY_REQUEST_GROUPS;
  const credits = creditsQuery.data?.credits ?? EMPTY_CREDITS;

  const selectedCredits = useMemo(() => {
    const idSet = new Set(selectedCreditIds ?? []);
    return credits.filter((c) => idSet.has(c.id));
  }, [credits, selectedCreditIds]);

  const selectedServiceNamesSet = useMemo(() => {
    return new Set(
      selectedCredits.map((c) => normalizeServiceName(c.serviceName)),
    );
  }, [selectedCredits]);

  const nearestMatchingDupe = useMemo(() => {
    if (!slot?.start) return null;
    if (selectedServiceNamesSet.size === 0) return null;

    const slotStartMs = new Date(slot.start).getTime();
    let best: RequestGroup | null = null;
    let bestDelta = Infinity;

    for (const rg of requestGroups) {
      if (!rg?.startTimestamp) continue;
      if (rg.status !== 'active') continue;
      const rgStartMs = new Date(rg.startTimestamp).getTime();

      const delta = Math.abs(rgStartMs - slotStartMs);
      if (delta > DAYS_30_MS) continue;

      const orders = rg?.orders ?? [];
      const matches = orders.some((o) => {
        const name = normalizeServiceName(o.serviceName);
        return !!name && selectedServiceNamesSet.has(name);
      });

      if (!matches) continue;

      if (delta < bestDelta) {
        best = rg;
        bestDelta = delta;
      }
    }
    return best;
  }, [requestGroups, slot?.start, selectedServiceNamesSet]);

  const dupeDate =
    nearestMatchingDupe?.startTimestamp && nearestMatchingDupe?.timezone
      ? moment(nearestMatchingDupe.startTimestamp)
          .tz(nearestMatchingDupe.timezone)
          .format('MMM D, YYYY')
      : null;

  return {
    dupeDate,
    nearestMatchingDupe,
  };
};
