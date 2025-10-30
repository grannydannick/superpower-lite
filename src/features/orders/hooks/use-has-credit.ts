import { useOrders } from '@/features/orders/api';
import { OrderStatus } from '@/types/api';

interface UseHasCreditProps {
  serviceName: string;
}

/**
 *
 * @param serviceName - Name of the service
 * @returns
 */
export const useHasCredit = ({ serviceName }: UseHasCreditProps) => {
  const ordersQuery = useOrders({});

  const draftOrders = ordersQuery.data?.orders?.filter(
    (o) => o.status === OrderStatus.draft,
  );

  const existingDraftOrder = draftOrders?.find(
    (o) => o.serviceName === serviceName,
  );

  return {
    isCreditLoading: ordersQuery.isLoading,
    credit: existingDraftOrder,
    hasCredit: !!existingDraftOrder,
  };
};
