import { useMemo } from 'react';

import { useOrders } from '@/features/orders/api';
import { useServices } from '@/features/services/api';
import { HealthcareService, Order } from '@/types/api';

export const useGroupedOrders = () => {
  const getOrdersQuery = useOrders();
  const getServicesQuery = useServices();

  return useMemo(() => {
    const all = getOrdersQuery.data?.orders ?? [];

    const buckets: {
      drafts: { order: Order; service?: HealthcareService }[];
      pending: { order: Order; service?: HealthcareService }[];
      upcoming: { order: Order; service?: HealthcareService }[];
      completed: { order: Order; service?: HealthcareService }[];
      canceled: { order: Order; service?: HealthcareService }[];
    } = {
      drafts: [],
      pending: [],
      upcoming: [],
      completed: [],
      canceled: [],
    };

    for (const o of all) {
      const s = getServicesQuery.data?.services.find(
        (s) => s.id === o.serviceId,
      );
      switch (o.status) {
        case 'DRAFT':
          buckets.drafts.push({ order: o, service: s });
          break;
        case 'PENDING':
          buckets.pending.push({ order: o, service: s });
          break;
        case 'UPCOMING':
          buckets.upcoming.push({ order: o, service: s });
          break;
        case 'COMPLETED':
          buckets.completed.push({ order: o, service: s });
          break;
        case 'CANCELLED':
          buckets.canceled.push({ order: o, service: s });
          break;
      }
    }

    return {
      buckets,
      all,
      groupedOrdersLoading:
        getOrdersQuery.isLoading || getServicesQuery.isLoading,
    };
  }, [
    getServicesQuery.data,
    getOrdersQuery.data,
    getOrdersQuery.isLoading,
    getServicesQuery.isLoading,
  ]);
};
