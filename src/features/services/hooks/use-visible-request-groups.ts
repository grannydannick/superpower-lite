import { useOrders } from '@/features/orders/api';
import { OrderStatus, RequestGroup } from '@/types/api';

const DEFAULT_VISIBLE = 12;

export function useVisibleRequestGroups(
  {
    status,
  }: {
    status?: OrderStatus;
  } = { status: OrderStatus.completed },
) {
  const { data, isLoading } = useOrders();
  const requestGroups = data?.requestGroups ?? [];

  const filtered = requestGroups.filter((rg) => [status].includes(rg.status));

  // 3) sort by priority then timestamp
  const sorted = [...filtered].sort((a, b) => {
    const timeA = getOrderTimestamp(a);
    const timeB = getOrderTimestamp(b);

    if (a.status === OrderStatus.completed) {
      return compareTimes(timeA, timeB, 'desc');
    }

    if (a.status === OrderStatus.active) {
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
    visibleRequestGroups: visible,
    restRequestGroups: rest,
    totalFiltered: filtered.length,
    isLoading: isLoading,
    defaultVisible: DEFAULT_VISIBLE,
  };
}

// helpers for sorting via timestamp
function getOrderTimestamp(order: RequestGroup): number | undefined {
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

function isWalkInOrder(order: RequestGroup): boolean {
  return order.appointmentType === 'UNSCHEDULED';
}
