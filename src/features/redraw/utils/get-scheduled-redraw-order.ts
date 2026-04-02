import type { Order, RequestGroup } from '@/types/api';

export function hasRedrawOrder(order: Order): boolean {
  return order.hasRedraw === true;
}

export function isScheduledRedrawOrder(order: Order): boolean {
  return hasRedrawOrder(order) && order.redrawStatus === 'scheduled';
}

export function getScheduledRedrawOrder(
  requestGroup: RequestGroup,
): Order | undefined {
  return requestGroup.orders.find(isScheduledRedrawOrder);
}
