import { useMemo } from 'react';

import {
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const/services';
import { useOrders } from '@/features/orders/api';
import { OrderStatus } from '@/types/api';

/**
 * Hook to get the active (non-completed/cancelled/revoked) blood panel order
 * Returns the soonest upcoming blood panel order by start timestamp
 */
export const useActiveBloodPanelOrders = () => {
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders();

  const activeBloodPanelOrder = useMemo(() => {
    const orders = ordersData?.orders ?? [];

    // Filter for blood panel orders that are not completed/cancelled/revoked
    const bloodPanelOrders = orders.filter(
      (order) =>
        (order.serviceName === SUPERPOWER_BLOOD_PANEL ||
          order.serviceName === ADVANCED_BLOOD_PANEL ||
          order.serviceName === CUSTOM_BLOOD_PANEL) &&
        order.status !== OrderStatus.draft &&
        order.status !== OrderStatus.completed &&
        order.status !== OrderStatus.cancelled &&
        order.status !== OrderStatus.revoked,
    );

    // Sort by start timestamp (soonest first for upcoming appointments)
    bloodPanelOrders.sort((a, b) => {
      if (!a.startTimestamp) return 1;
      if (!b.startTimestamp) return -1;
      return (
        new Date(a.startTimestamp).getTime() -
        new Date(b.startTimestamp).getTime()
      );
    });

    return bloodPanelOrders[0] || null;
  }, [ordersData]);

  return {
    activeBloodPanelOrder,
    isLoading: isOrdersLoading,
  };
};
