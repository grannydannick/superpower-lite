import { useMemo } from 'react';

import {
  CUSTOM_BLOOD_PANEL,
  ADVANCED_BLOOD_PANEL,
  LAB_ORDER_SUPPORTED_SERVICES,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const/services';
import { useOrders } from '@/features/orders/api';
import { usePlans } from '@/features/plans/api/get-plans';
import { useIsMobile } from '@/hooks/use-mobile';
import { OrderStatus } from '@/types/api';

import { useHomepageStore } from '../stores/homepage-store';
import { HomepageState, VisibleCard } from '../types';

/**
 * Hook to compute homepage state from various data sources
 * and return the visible cards based on that state
 */
export const useHomepageState = (): {
  state: HomepageState;
  visibleCards: VisibleCard[];
  isLoading: boolean;
} => {
  const getVisibleCards = useHomepageStore((store) => store.getVisibleCards);

  const isMobile = useIsMobile();

  const { data: plansData, isLoading: isPlansLoading } = usePlans();
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders();

  const isLoading = isPlansLoading || isOrdersLoading;

  const state = useMemo<HomepageState>(() => {
    const actionPlans = plansData?.actionPlans ?? [];
    const completedActionPlans = actionPlans.filter(
      (plan) => plan.status === 'completed',
    );
    const hasCompletedActionPlan = completedActionPlans.length > 0;
    const hasMultipleActionPlans = completedActionPlans.length > 1;

    const orders = ordersData?.orders ?? [];

    // Upcoming lab orders (Active order which are not blood panel orders)
    const hasActiveLabOrders = orders.some(
      (order) =>
        order.status === OrderStatus.upcoming &&
        !LAB_ORDER_SUPPORTED_SERVICES.includes(order.serviceName),
    );

    // Upcoming, active, draft, or completed orders (Actionable orders)
    const hasActionableOrders = orders.some((order) =>
      [OrderStatus.active, OrderStatus.draft, OrderStatus.completed].includes(
        order.status,
      ),
    );

    // Upcoming or active blood panel orders (In progress)
    const hasActiveBloodPanelOrders = orders.some(
      (order) =>
        [OrderStatus.upcoming, OrderStatus.active].includes(order.status) &&
        [
          SUPERPOWER_BLOOD_PANEL,
          ADVANCED_BLOOD_PANEL,
          CUSTOM_BLOOD_PANEL,
        ].includes(order.serviceName),
    );

    return {
      isMobile,
      hasActiveLabOrders,
      hasActionableOrders,
      hasCompletedActionPlan,
      hasMultipleActionPlans,
      hasActiveBloodPanelOrders,
    };
  }, [plansData, ordersData, isMobile]);

  const visibleCards = useMemo(() => {
    if (isLoading) {
      return [];
    }
    return getVisibleCards(state);
  }, [isLoading, getVisibleCards, state]);

  return { state, visibleCards, isLoading };
};
