import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getOrdersQueryOptions } from '@/features/orders/api';
import { OrderStatus } from '@/types/api';

export const useCurrentLabOrders = () => {
  const query = useQuery(getOrdersQueryOptions());
  const data = query.data;

  const activeLabOrders = useMemo(() => {
    const requestGroups = data?.requestGroups ?? [];

    // Filter for blood panel orders that are not completed/revoked
    const bloodPanelOrders = requestGroups.filter((rg) => {
      if (rg.appointmentType === undefined) return false;
      if (rg.status === OrderStatus.draft) return false;
      if (rg.status === OrderStatus.completed) return false;
      if (rg.status === OrderStatus.revoked) return false;

      // TODO: potentially query care plans as well
      // if (order.carePlan?.status === 'completed') return false;

      // NOTE (Nikita): there also was following case here:
      // Filter out legacy orders with completed diagnosticReport older than 30 days
      // we ran a migration to sync all service requests and diagnostic reports so I assume its not needed anymore

      return true;
    });

    // Sort by start timestamp (soonest first for upcoming appointments)
    bloodPanelOrders.sort((a, b) => {
      if (!a.startTimestamp) return 1;
      if (!b.startTimestamp) return -1;
      return (
        new Date(a.startTimestamp).getTime() -
        new Date(b.startTimestamp).getTime()
      );
    });

    return bloodPanelOrders;
  }, [data]);

  return {
    activeLabOrders,
    isError: query.isError,
    isPending: query.isPending,
  };
};
