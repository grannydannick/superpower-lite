import { MultiPlatformOrder } from '@/types/api';

export const groupOrdersByMonthAndYear = (
  multiPlatformOrders: MultiPlatformOrder[],
) => {
  return multiPlatformOrders.reduce<Record<string, MultiPlatformOrder[]>>(
    (acc, order) => {
      const date = new Date(order.occurredAt);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      const key = `${month} ${year}`;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(order);
      return acc;
    },
    {},
  );
};
