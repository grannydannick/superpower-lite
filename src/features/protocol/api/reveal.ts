import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';

import { useAnalytics } from '@/hooks/use-analytics';
import { $api, api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

import type { CheckoutItem } from '../stores/checkout-store';

// Extract response types from generated operations
type RevealLatestResponse =
  operations['protocol.reveal.getOrCreateReveal']['responses'][200]['content']['application/json'];

type RevealStatusResponseType =
  operations['protocol.reveal.getRevealStatus']['responses'][200]['content']['application/json'];

type RevealStatusPayload = NonNullable<RevealStatusResponseType>;

export type RevealStatusResponse = RevealStatusResponseType;

type ProductCheckoutResponse =
  operations['protocol.reveal.createShopifyCheckout']['responses'][200]['content']['application/json'];

type CreateProtocolOrderResponse =
  operations['protocol.reveal.createProtocolOrder']['responses'][200]['content']['application/json'];

type CreateServiceOrdersResponse =
  operations['protocol.reveal.createServiceOrders']['responses'][200]['content']['application/json'];

type MarkStepCompleteResponse =
  operations['protocol.reveal.markStepComplete']['responses'][200]['content']['application/json'];

type CompleteRevealResponse =
  operations['protocol.reveal.completeReveal']['responses'][200]['content']['application/json'];

export type ServiceFulfillmentStatus = 'PENDING' | 'DRAFT' | 'BOOKED';
export type RxFulfillmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type ProductFulfillmentStatus =
  | 'PENDING'
  | 'CHECKOUT_STARTED'
  | 'COMPLETED';

export type RevealProgress = RevealStatusPayload['progress'];
export type FulfillmentStates = RevealStatusPayload['fulfillmentStates'];

export type RevealServiceItem = NonNullable<
  RevealStatusPayload['reveal']['protocolOrder']
>['serviceItems'][number];

export type RevealRxItem = NonNullable<
  RevealStatusPayload['reveal']['protocolOrder']
>['rxItems'][number];

const revealLatestQueryOptions = $api.queryOptions(
  'post',
  '/protocol/reveal/latest',
);

export const revealLatestQueryKey = revealLatestQueryOptions.queryKey;

const getRevealStatusQueryOptions = (carePlanId: string) =>
  $api.queryOptions('get', '/protocol/reveal/{carePlanId}/status', {
    params: {
      path: { carePlanId },
    },
  });

export const getRevealStatusQueryKey = (carePlanId: string) =>
  getRevealStatusQueryOptions(carePlanId).queryKey;

const getProductCheckoutQueryOptions = (carePlanId: string) =>
  $api.queryOptions('post', '/protocol/reveal/{carePlanId}/checkout/products', {
    params: {
      path: { carePlanId },
    },
  });

export function useRevealLatest() {
  return useQuery({
    ...revealLatestQueryOptions,
  }) as UseQueryResult<RevealLatestResponse>;
}

export function useRevealStatus(
  carePlanId: string,
  options?: { enabled?: boolean; refetchInterval?: number },
) {
  const queryOptions = getRevealStatusQueryOptions(carePlanId);

  return useQuery({
    ...queryOptions,
    enabled: options?.enabled !== false && !!carePlanId,
    refetchInterval: options?.refetchInterval,
  }) as UseQueryResult<RevealStatusResponse>;
}

type CreateProtocolOrderInput = {
  carePlanId: string;
  items: CheckoutItem[];
};

type ProtocolOrderProductItem = {
  id: string;
  name: string;
  image?: string;
  price: number;
  url: string;
  discount: number;
  type: string;
  inventoryQuantity: number;
  tags?: string[];
  vendor?: string;
  quantity: number;
};

const mapCheckoutItemsToPayload = (items: CheckoutItem[]) => {
  const services: Array<{ serviceId: string; serviceName: string }> = [];
  const rx: Array<{ rxCatalogId: string }> = [];
  const products: ProtocolOrderProductItem[] = [];

  for (const item of items) {
    const activity = item.data;
    if (activity.type === 'service' && activity.service) {
      services.push({
        serviceId: activity.service.id,
        serviceName: activity.service.name,
      });
    } else if (activity.type === 'prescription' && activity.prescription) {
      rx.push({
        rxCatalogId: activity.prescription.id,
      });
    } else if (activity.type === 'product' && activity.product) {
      products.push({
        id: activity.product.id,
        name: activity.product.name,
        image: activity.product.image,
        price: Number(activity.product.price),
        url: activity.product.url,
        discount: Number(activity.product.discount ?? 0),
        type: activity.product.type,
        inventoryQuantity: activity.product.inventoryQuantity,
        tags: activity.product.tags,
        vendor: activity.product.vendor,
        quantity: 1,
      });
    }
  }

  return {
    services,
    rx,
    products,
    hasProducts: products.length > 0,
  };
};

const useRevealQueryInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateRevealStatus = (carePlanId?: string | null) => {
    if (!carePlanId) return;
    const { queryKey } = getRevealStatusQueryOptions(carePlanId);
    void queryClient.invalidateQueries({ queryKey });
  };

  const invalidateRevealLatest = () => {
    void queryClient.invalidateQueries({
      queryKey: revealLatestQueryKey,
    });
  };

  return { invalidateRevealStatus, invalidateRevealLatest };
};

export function useCreateProtocolOrder() {
  const { invalidateRevealStatus } = useRevealQueryInvalidation();
  const { track } = useAnalytics();

  return useMutation<
    CreateProtocolOrderResponse & {
      summary: {
        hasProducts: boolean;
        hasServices: boolean;
        hasRx: boolean;
      };
    },
    Error,
    CreateProtocolOrderInput
  >({
    mutationFn: async ({ carePlanId, items }: CreateProtocolOrderInput) => {
      const { services, rx, products, hasProducts } =
        mapCheckoutItemsToPayload(items);

      track('protocol_reveal_order_created', {
        careplanId: carePlanId,
        services,
        rx,
        products,
      });
      const response = await api.POST('/protocol/reveal/{carePlanId}/order', {
        params: {
          path: { carePlanId },
        },
        body: {
          services: services.length > 0 ? services : undefined,
          rx: rx.length > 0 ? rx : undefined,
          products: products.length > 0 ? products : undefined,
        },
      });
      if (response.error) throw response.error;
      return {
        ...(response.data as CreateProtocolOrderResponse),
        summary: {
          hasProducts,
          hasServices: services.length > 0,
          hasRx: rx.length > 0,
        },
      };
    },
    onSuccess: (_, variables) => {
      invalidateRevealStatus(variables.carePlanId);
    },
  });
}

export function useCreateServiceOrders() {
  const { invalidateRevealStatus } = useRevealQueryInvalidation();
  const { track } = useAnalytics();

  return useMutation<
    CreateServiceOrdersResponse,
    Error,
    { carePlanId: string; paymentMethodId?: string }
  >({
    mutationFn: async (data: {
      carePlanId: string;
      paymentMethodId?: string;
    }) => {
      track('protocol_reveal_service_orders_created', {
        careplanId: data.carePlanId,
        paymentMethodId: data.paymentMethodId,
      });
      const response = await api.POST(
        '/protocol/reveal/{carePlanId}/checkout/services',
        {
          params: {
            path: { carePlanId: data.carePlanId },
          },
          body: {
            paymentMethodId: data.paymentMethodId,
          },
        },
      );
      if (response.error) throw response.error;
      return response.data as CreateServiceOrdersResponse;
    },
    onSuccess: (_, variables) => {
      invalidateRevealStatus(variables.carePlanId);
    },
  });
}

export function useMarkStepComplete() {
  const { invalidateRevealStatus } = useRevealQueryInvalidation();

  return useMutation<
    MarkStepCompleteResponse,
    Error,
    { carePlanId: string; step: 'intro' }
  >({
    mutationFn: async (data: { carePlanId: string; step: 'intro' }) => {
      const response = await api.POST(
        '/protocol/reveal/{carePlanId}/steps/{step}/complete',
        {
          params: {
            path: { carePlanId: data.carePlanId, step: data.step },
          },
        },
      );
      if (response.error) throw response.error;
      return response.data as MarkStepCompleteResponse;
    },
    onSuccess: (_, variables) => {
      invalidateRevealStatus(variables.carePlanId);
    },
  });
}

export function useCompleteReveal() {
  const { track } = useAnalytics();
  const { invalidateRevealStatus, invalidateRevealLatest } =
    useRevealQueryInvalidation();

  return useMutation<CompleteRevealResponse, Error, string>({
    mutationFn: async (carePlanId: string) => {
      const response = await api.POST(
        '/protocol/reveal/{carePlanId}/complete',
        {
          params: {
            path: { carePlanId },
          },
        },
      );
      if (response.error) throw response.error;
      return response.data as CompleteRevealResponse;
    },
    onSuccess: (_, carePlanId) => {
      track('protocol_reveal_completed', {
        careplanId: carePlanId,
      });
      invalidateRevealStatus(carePlanId);
      invalidateRevealLatest();
    },
  });
}

export function useProductCheckoutUrl(
  carePlanId: string,
  options?: { enabled?: boolean },
) {
  const queryOptions = getProductCheckoutQueryOptions(carePlanId);

  return useQuery({
    ...queryOptions,
    enabled: options?.enabled !== false && !!carePlanId,
    refetchOnWindowFocus: false,
  }) as UseQueryResult<ProductCheckoutResponse>;
}

// Autopilot subscription checkout - returns checkoutUrl on success, throws 404 on error
type AutopilotCheckoutResponse =
  operations['protocol.reveal.createAutopilotSubscription']['responses'][200]['content']['application/json'];

export function useCreateAutopilotCheckout() {
  return useMutation<
    AutopilotCheckoutResponse,
    Error,
    { carePlanId: string; returnUrl: string }
  >({
    mutationFn: async (data: { carePlanId: string; returnUrl: string }) => {
      const response = await api.POST(
        '/protocol/reveal/{carePlanId}/autopilot-subscription',
        {
          params: {
            path: { carePlanId: data.carePlanId },
          },
          body: {
            returnUrl: data.returnUrl,
          },
        },
      );
      if (response.error) throw response.error;
      return response.data as AutopilotCheckoutResponse;
    },
  });
}
