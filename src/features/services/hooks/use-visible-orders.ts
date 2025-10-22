import { useOrders } from '@/features/orders/api';
import { OrderStatus, Order } from '@/types/api';

const DEFAULT_VISIBLE = 12;

export function useVisibleOrders() {
  const { data, isLoading } = useOrders();
  const orders: Order[] = data?.orders ?? [];

  // 1) filter out drafts
  const filtered = orders.filter((order) => order.status !== OrderStatus.draft);

  // 2) define status-priority map
  const statusPriority: Record<OrderStatus, number> = {
    [OrderStatus.upcoming]: 1,
    [OrderStatus.pending]: 2,
    [OrderStatus.completed]: 3,
    [OrderStatus.cancelled]: 4,
    [OrderStatus.revoked]: 5,
    [OrderStatus.draft]: Number.MAX_SAFE_INTEGER,
  };

  // 3) sort by priority then timestamp
  const sorted = [...filtered].sort((a, b) => {
    const priA = statusPriority[a.status];
    const priB = statusPriority[b.status];
    if (priA !== priB) return priA - priB;

    // if same status, soonest start first
    return (
      (a.startTimestamp ? new Date(a.startTimestamp).getTime() : Infinity) -
      (b.startTimestamp ? new Date(b.startTimestamp).getTime() : Infinity)
    );
  });

  // 4) split into visible + rest
  const visible = sorted.slice(0, DEFAULT_VISIBLE);
  const rest = sorted.slice(DEFAULT_VISIBLE);

  return {
    visibleOrders: visible,
    restOrders: rest,
    totalFiltered: filtered.length,
    isLoading: isLoading,
    defaultVisible: DEFAULT_VISIBLE,
  };
}
