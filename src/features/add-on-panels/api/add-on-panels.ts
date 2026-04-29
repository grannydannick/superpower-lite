import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

type OnboardingAddOnsResponse =
  operations['onboarding.getOnboardingAddOns']['responses'][200]['content']['application/json'];
type AddOnGroup = OnboardingAddOnsResponse['groups'][number];
type AddOnFilter = OnboardingAddOnsResponse['filters'][number];
type AddOnMeta = OnboardingAddOnsResponse['meta'];
type AddOnSelection = AddOnGroup['selection'];
type AddOnBundleSelection = Extract<
  AddOnSelection,
  { type: 'bundle-or-components' }
>;
type AddOnIndependentSelection = Extract<
  AddOnSelection,
  { type: 'independent' }
>;
type AddOnItem =
  | NonNullable<AddOnBundleSelection['bundle']>
  | AddOnBundleSelection['components'][number]
  | AddOnIndependentSelection['items'][number];
type AddOnItemId = AddOnItem['id'];

/** Product prose embedded on each add-on marketplace row from `/rpc/onboarding/add-ons`. */
export type AddOnProductDetails = NonNullable<AddOnItem['productDetails']>;

export type {
  AddOnFilter,
  AddOnGroup,
  AddOnIndependentSelection,
  AddOnItem,
  AddOnItemId,
  AddOnMeta,
  AddOnSelection,
  AddOnBundleSelection,
  OnboardingAddOnsResponse,
};

export type AddOnCollectionMethod = 'phlebotomy' | 'test-kit';

export const getOnboardingAddOnsQueryOptions = (input?: {
  collectionMethod?: AddOnCollectionMethod;
}) =>
  $api.queryOptions('get', '/rpc/onboarding/add-ons', {
    params: {
      query: input?.collectionMethod
        ? { collectionMethod: input.collectionMethod }
        : undefined,
    },
  });

export function useOnboardingAddOns(options?: {
  enabled?: boolean;
  collectionMethod?: AddOnCollectionMethod;
}) {
  return useQuery({
    ...getOnboardingAddOnsQueryOptions({
      collectionMethod: options?.collectionMethod,
    }),
    enabled: options?.enabled ?? true,
  });
}

export function useSuspenseOnboardingAddOns(input?: {
  collectionMethod?: AddOnCollectionMethod;
}) {
  return useSuspenseQuery(getOnboardingAddOnsQueryOptions(input));
}
