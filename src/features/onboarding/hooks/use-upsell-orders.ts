import { useOrders } from '@/features/orders/api';

import { UPSELL_SERVICES } from '../const/upsell-services';

/**
 * This hook is used to get the upsell orders from the orders API.
 * It exposes therefore the data, isLoading, and isError states.
 */
export const useUpsellOrders = () => {
  const { data: ordersData, isLoading, isError } = useOrders();

  const upsellNames = new Set(
    UPSELL_SERVICES.map((service) => service.item.name),
  );

  const data =
    ordersData?.orders.filter((order) => upsellNames.has(order.name)) ?? [];

  return {
    data,
    isLoading,
    isError,
  };
};
