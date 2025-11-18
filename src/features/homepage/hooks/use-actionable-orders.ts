import { useMemo } from 'react';

import { useOrders } from '@/features/orders/api';
import { usePlans } from '@/features/plans/api/get-plans';
import { OrderStatus } from '@/types/api';

type OrderWithCarePlan = {
  id: string;
  serviceName: string;
  serviceId: string;
  status: OrderStatus;
  carePlanId?: string;
  carePlanTitle?: string;
};

/**
 * Hook to compute actionable orders:
 * - All draft orders (for booking)
 * - Active/completed orders that have a completed care plan (to view plan)
 */
export const useActionableOrders = () => {
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders();
  const { data: plansData, isLoading: isPlansLoading } = usePlans({});

  const actionableOrders = useMemo(() => {
    const orders = ordersData?.orders ?? [];
    const plans = plansData?.actionPlans ?? [];

    // Create a map of order ID to completed care plan only
    const orderToCarePlanMap = new Map<
      string,
      { id: string; title?: string }
    >();

    plans
      .filter((plan) => plan.status === 'completed')
      .forEach((plan) => {
        const supportingInfo = plan.supportingInfo ?? [];
        supportingInfo.forEach((info) => {
          // Extract order ID from "ServiceRequest/{orderId}" format
          const reference = info.reference;
          if (reference?.startsWith('ServiceRequest/')) {
            const orderId = reference.replace('ServiceRequest/', '');
            orderToCarePlanMap.set(orderId, {
              id: plan.id!,
              title: plan.title,
            });
          }
        });
      });

    // Filter for draft orders and active/completed orders with completed care plans
    const result: OrderWithCarePlan[] = orders
      .filter((order) => {
        if (order.status === OrderStatus.draft) {
          return true;
        }
        if (
          order.status === OrderStatus.active ||
          order.status === OrderStatus.completed
        ) {
          return orderToCarePlanMap.has(order.id);
        }
        return false;
      })
      .map((order) => {
        const carePlan = orderToCarePlanMap.get(order.id);
        return {
          id: order.id,
          serviceName: order.serviceName,
          serviceId: order.serviceId,
          status: order.status,
          carePlanId: carePlan?.id,
          carePlanTitle: carePlan?.title,
        };
      });

    return result;
  }, [ordersData, plansData]);

  return {
    actionableOrders,
    isLoading: isOrdersLoading || isPlansLoading,
  };
};

export type { OrderWithCarePlan };
