import { useOrders } from '@/features/orders/api';
import { useAuthorization } from '@/lib/authorization';
import { Order, OrderStatus } from '@/types/api';

const DEFAULT_VISIBLE = 12;

export function useVisibleOrders() {
  const { data, isLoading } = useOrders();
  const orders: Order[] = data?.orders ?? [];
  const { checkAdminActorAccess } = useAuthorization();

  const isAdmin = checkAdminActorAccess();

  // 1) filter out drafts
  const filtered = isAdmin
    ? orders.filter((order) => ![OrderStatus.draft].includes(order.status))
    : orders.filter(
        (order) =>
          ![OrderStatus.draft, OrderStatus.cancelled].includes(order.status),
      );

  // 2) define status-priority map
  const statusPriority: Record<OrderStatus, number> = {
    [OrderStatus.upcoming]: 1,
    [OrderStatus.active]: 2,
    [OrderStatus.pending]: 3,
    [OrderStatus.completed]: 4,
    [OrderStatus.cancelled]: 5,
    [OrderStatus.revoked]: 6,
    [OrderStatus.draft]: Number.MAX_SAFE_INTEGER,
  };

  // 3) sort by priority then timestamp
  const sorted = [...filtered].sort((a, b) => {
    const priA = statusPriority[a.status];
    const priB = statusPriority[b.status];
    if (priA !== priB) return priA - priB;

    const timeA = getOrderTimestamp(a);
    const timeB = getOrderTimestamp(b);

    if (a.status === OrderStatus.completed) {
      return compareTimes(timeA, timeB, 'desc');
    }

    if (a.status === OrderStatus.upcoming || a.status === OrderStatus.pending) {
      const isWalkInA = isWalkInOrder(a);
      const isWalkInB = isWalkInOrder(b);

      if (isWalkInA !== isWalkInB) {
        return isWalkInA ? -1 : 1;
      }

      return compareTimes(timeA, timeB, 'desc');
    }

    return compareTimes(timeA, timeB, 'asc');
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

// helpers for sorting via timestamp
function getOrderTimestamp(order: Order): number | undefined {
  const { status, endTimestamp, startTimestamp, createdAt } = order;

  if (status === OrderStatus.completed) {
    return (
      getTime(endTimestamp) ?? getTime(startTimestamp) ?? getTime(createdAt)
    );
  }

  return getTime(startTimestamp) ?? getTime(endTimestamp) ?? getTime(createdAt);
}

function compareTimes(
  timeA: number | undefined,
  timeB: number | undefined,
  direction: 'asc' | 'desc',
): number {
  if (timeA === undefined && timeB === undefined) return 0;
  if (timeA === undefined) return direction === 'asc' ? 1 : -1;
  if (timeB === undefined) return direction === 'asc' ? -1 : 1;

  return direction === 'asc' ? timeA - timeB : timeB - timeA;
}

function getTime(timestamp?: string): number | undefined {
  return timestamp ? new Date(timestamp).getTime() : undefined;
}

function isWalkInOrder(order: Order): boolean {
  return order.appointmentType === 'UNSCHEDULED';
}
