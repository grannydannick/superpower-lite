import { useMemo } from 'react';

import {
  ENVIRONMENTAL_TOXINS,
  GUT_MICROBIOME_ANALYSIS,
} from '@/const/services';
import { useOrders } from '@/features/orders/api';
import type { Order } from '@/types/api';

import { useProtocols } from '../api';

type ServiceForProtocol = {
  order?: Order;
  serviceName?: string;
  coverImage?: string;
};

/**
 * Hook variant that accepts a list of protocol IDs and returns a mapping
 * of protocolId -> { order, serviceName, coverImage } for direct lookup
 * without needing a selector function call in render.
 */
export function useServicesForProtocols(protocolIds: string[]) {
  const { isLoading: isProtocolsLoading } = useProtocols();
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders();

  const carePlanToOrderMap = useMemo(() => {
    // Map from protocolId (carePlanId) -> Order
    const map = new Map<string, Order>();
    const orders = ordersData?.orders ?? [];
    orders.forEach((order) => {
      const carePlanId = order.carePlan?.id;
      if (carePlanId) {
        map.set(carePlanId, order);
      }
    });
    return map;
  }, [ordersData]);

  const map: Map<string, ServiceForProtocol> = useMemo(() => {
    const out = new Map<string, ServiceForProtocol>();
    protocolIds.forEach((id) => {
      const order = carePlanToOrderMap.get(id);
      const serviceName = order?.serviceName;
      let coverImage: string | undefined;
      switch (serviceName) {
        case ENVIRONMENTAL_TOXINS:
          coverImage = '/action-plan/toxins-book-cover.webp';
          break;
        case GUT_MICROBIOME_ANALYSIS:
          coverImage = '/action-plan/gut-book-cover.webp';
          break;
        default:
          coverImage = undefined;
      }
      out.set(id, { order, serviceName, coverImage });
    });
    return out;
  }, [protocolIds, carePlanToOrderMap]);

  return {
    servicesMap: map,
    isLoading: isProtocolsLoading || isOrdersLoading,
  };
}
