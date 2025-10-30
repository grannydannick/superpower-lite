import { useOrders } from '@/features/orders/api';

interface UseHasCreditProps {
  serviceName: string;
}

/**
 *
 * @param serviceName - Name of the service
 * @param serviceId - Optional serviceId for strict checks
 * @param collectionMethod - Optional collectionMethod for strict checks
 * @returns
 */
export const useHasCredit = ({ serviceName }: UseHasCreditProps) => {
  const ordersQuery = useOrders({});

  const existingDraftOrder = ordersQuery.data?.orders?.find(
    (o) => o.serviceName === serviceName,
  );

  return {
    isCreditLoading: ordersQuery.isLoading,
    credit: existingDraftOrder,
    hasCredit: !!existingDraftOrder,
  };
};
