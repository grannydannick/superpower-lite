import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { MultiPlatformOrder } from '@/types/api';

// TODO: remove this when done, this is for USTIN:

// const mockOrders: MultiPlatformOrder[] = [
//   {
//     name: '1-1 Advisory Call',
//     price: 10000,
//     occurredAt: '2024-08-29T16:04:40.477Z',
//     type: 'service',
//     image: '/services/1-1_advisory_call.png',
//     invoiceId: 'in_1PtApuHqpzWln5lNW5d9Bb05',
//   },
//   {
//     name: 'Superpower Blood Panel',
//     price: 30800,
//     occurredAt: '2024-08-08T16:12:09.658Z',
//     type: 'service',
//     image: '/services/superpower_blood_panel.png',
//     invoiceId: 'in_1PlYwbHqpzWln5lNroZDhN47',
//   },
//   {
//     name: 'Environmental Toxins',
//     price: 0,
//     occurredAt: '2024-05-16T05:26:39.844Z',
//     type: 'service',
//     image: '/services/environmental_toxins.png',
//   },
//   {
//     name: 'Superpower Blood Panel',
//     price: 0,
//     occurredAt: '2024-04-26T01:33:11.458Z',
//     type: 'service',
//     image: '/services/superpower_blood_panel.png',
//   },
//   {
//     name: 'Superpower Blood Panel',
//     price: 0,
//     occurredAt: '2024-02-08T06:46:03.110Z',
//     type: 'service',
//     image: '/services/superpower_blood_panel.png',
//   },
//   {
//     name: 'Superpower Blood Panel',
//     price: 0,
//     occurredAt: '2024-01-16T20:06:34.227Z',
//     type: 'service',
//     image: '/services/superpower_blood_panel.png',
//   },
//   {
//     name: 'Superpower Blood Panel',
//     price: 0,
//     occurredAt: '2023-10-09T22:50:44.918Z',
//     type: 'service',
//     image: '/services/superpower_blood_panel.png',
//   },
//   {
//     name: 'IV Drip',
//     price: 999,
//     occurredAt: '2023-10-09T18:06:57.971Z',
//     type: 'service',
//     image: '/services/iv_drip.png',
//   },
//   {
//     name: 'IV Drip',
//     price: 999,
//     occurredAt: '2023-10-08T01:56:22.088Z',
//     type: 'service',
//     image: '/services/iv_drip.png',
//   },
//   {
//     name: 'IV Drip',
//     price: 999,
//     occurredAt: '2023-08-18T02:50:24.063Z',
//     type: 'service',
//     image: '/services/iv_drip.png',
//   },
//   {
//     name: 'The Complete Snowboard - Powder',
//     price: 69995,
//     occurredAt: '2024-07-25T03:53:09.000Z',
//     type: 'product',
//     image:
//       'https://cdn.shopify.com/s/files/1/0581/1411/3605/products/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1705988080',
//     invoiceUrl:
//       'https://superpower-staging.myshopify.com/58114113605/orders/3a81dda295454fcd1968e39cc739ea6f/authenticate?key=b4cedd6fcd93770ecf6c41e9d366529e&none=XANVAV9LUl9RRFc',
//   },
//   {
//     name: 'The Inventory Not Tracked Snowboard',
//     price: 94995,
//     occurredAt: '2024-07-25T03:53:09.000Z',
//     type: 'product',
//     image:
//       'https://cdn.shopify.com/s/files/1/0581/1411/3605/products/snowboard_purple_hydrogen.png?v=1705988080',
//     invoiceUrl:
//       'https://superpower-staging.myshopify.com/58114113605/orders/3a81dda295454fcd1968e39cc739ea6f/authenticate?key=b4cedd6fcd93770ecf6c41e9d366529e&none=XANVAV9LUl9RRFc',
//   },
//   {
//     name: '1-1 Advisory Call',
//     price: 0,
//     occurredAt: '2023-07-31T02:30:14.105Z',
//     type: 'service',
//     image: '/services/1-1_advisory_call.png',
//   },
//   {
//     name: 'Superpower Blood Panel',
//     price: 0,
//     occurredAt: '2023-07-18T19:18:38.009Z',
//     type: 'service',
//     image: '/services/superpower_blood_panel.png',
//   },
//   {
//     name: 'Superpower Membership',
//     price: 69999,
//     occurredAt: '2023-12-11T22:02:09.000Z',
//     type: 'membership',
//     invoiceId: 'in_1OMHYDHqpzWln5lNPjRbITSd',
//   },
// ];

export const getMultiPlatformOrders = (): Promise<{
  multiPlatformOrders: MultiPlatformOrder[];
}> => {
  return api.get('/orders/all-platforms');
  // return Promise.resolve({ multiPlatformOrders: mockOrders });
};

export const getMultiPlatformOrdersQueryOptions = () => {
  return queryOptions({
    queryKey: ['multiPlatformOrders'],
    queryFn: () => getMultiPlatformOrders(),
  });
};

type UseMultiPlatformOrdersOptions = {
  queryConfig?: QueryConfig<typeof getMultiPlatformOrdersQueryOptions>;
};

export const useMultiPlatformOrders = ({
  queryConfig,
}: UseMultiPlatformOrdersOptions = {}) => {
  return useQuery({
    ...getMultiPlatformOrdersQueryOptions(),
    ...queryConfig,
  });
};
