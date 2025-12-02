import { useMemo } from 'react';

import { isBloodPanelService } from '@/const/services';
import { useBiomarkers } from '@/features/data/api';
import { useOrders } from '@/features/orders/api';
import { usePlans } from '@/features/plans/api/get-plans';
import { OrderStatus } from '@/types/api';

export type DataGatingState = {
  isLoading: boolean;
  hasCompletedPlan: boolean;
  biomarkersLoaded: boolean;
  hasAnyBiomarkers: boolean;
  hasUncompletedOrder: boolean;
  hasRelevantCompletedOrder: boolean;
  shouldShowWaiting: boolean;
  isTestAppointmentOlderThan5Days: boolean;
  isAppointmentInFuture: boolean;
  hasNoOrders: boolean;
};

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

// Centralizes the logic for when to show/hide data based on plans, orders, and biomarkers
export const useDataGating = (): DataGatingState => {
  const { data: orders, isLoading: isOrdersLoading } = useOrders();
  const { data: biomarkers, isLoading: isBiomarkersLoading } = useBiomarkers();
  const { data: plans, isLoading: isPlansLoading } = usePlans({});

  const hasCompletedPlan = useMemo(
    () => plans?.actionPlans?.some((p) => p.status === 'completed') ?? false,
    [plans?.actionPlans],
  );

  const biomarkersLoaded = useMemo(() => !!biomarkers, [biomarkers]);

  const hasAnyBiomarkers = useMemo(
    () => (biomarkers?.biomarkers?.length ?? 0) > 0,
    [biomarkers?.biomarkers],
  );

  const hasUncompletedOrder = useMemo(
    () =>
      orders?.orders?.some(
        (o) =>
          o.status !== OrderStatus.completed &&
          isBloodPanelService(o.serviceName),
      ) ?? false,
    [orders?.orders],
  );

  const hasRelevantCompletedOrder = useMemo(
    () =>
      orders?.orders?.some(
        (o) =>
          o.status === OrderStatus.completed &&
          isBloodPanelService(o.serviceName),
      ) ?? false,
    [orders?.orders],
  );

  // find the most recent appointment start for relevant tests
  const latestRelevantAppointmentTime = useMemo(() => {
    const relevantAppointments = orders?.orders?.filter(
      (o) =>
        !!o.startTimestamp &&
        isBloodPanelService(o.serviceName) &&
        o.status !== OrderStatus.cancelled &&
        o.status !== OrderStatus.revoked,
    );

    if (!relevantAppointments || relevantAppointments.length === 0)
      return undefined;

    const latest = relevantAppointments.reduce<number>((max, o) => {
      const t = new Date(o.startTimestamp as string).getTime();
      return t > max ? t : max;
    }, 0);

    return latest || undefined;
  }, [orders?.orders]);

  const isTestAppointmentOlderThan5Days = useMemo(() => {
    if (!latestRelevantAppointmentTime) return false;

    return latestRelevantAppointmentTime < Date.now() - FIVE_DAYS_MS;
  }, [latestRelevantAppointmentTime]);

  // User has a relevant service appointment scheduled in the future
  const isAppointmentInFuture = useMemo(() => {
    if (!latestRelevantAppointmentTime) return false;

    return latestRelevantAppointmentTime > Date.now();
  }, [latestRelevantAppointmentTime]);

  const isLoading = isBiomarkersLoading || isOrdersLoading || isPlansLoading;

  // Waiting when: not loading AND (no completed plan OR biomarkers not loaded
  // OR neither completed order nor any biomarker values exist)
  const shouldShowWaiting =
    !isLoading &&
    (!hasCompletedPlan ||
      !biomarkersLoaded ||
      !(hasRelevantCompletedOrder || hasAnyBiomarkers));

  // Return true when the user has no orders at all or all orders are in DRAFT, REVOKED, or CANCELLED states (needs to schedule)
  const hasNoOrders =
    !orders?.orders ||
    orders.orders.length === 0 ||
    orders.orders.every(
      (o) =>
        o.status === OrderStatus.draft ||
        o.status === OrderStatus.revoked ||
        o.status === OrderStatus.cancelled,
    );

  return {
    isLoading,
    hasCompletedPlan,
    biomarkersLoaded,
    hasAnyBiomarkers,
    hasUncompletedOrder,
    hasRelevantCompletedOrder,
    shouldShowWaiting,
    isTestAppointmentOlderThan5Days,
    isAppointmentInFuture,
    hasNoOrders,
  };
};
