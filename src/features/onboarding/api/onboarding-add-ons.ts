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
type AddOnItemStatus = AddOnItem['status'];

export type {
  AddOnFilter,
  AddOnGroup,
  AddOnIndependentSelection,
  AddOnItem,
  AddOnItemId,
  AddOnItemStatus,
  AddOnMeta,
  AddOnSelection,
  AddOnBundleSelection,
  OnboardingAddOnsResponse,
};

export const getOnboardingAddOnsQueryOptions = () =>
  $api.queryOptions('get', '/rpc/onboarding/add-ons');

export function useOnboardingAddOns(options?: { enabled?: boolean }) {
  return useQuery({
    ...getOnboardingAddOnsQueryOptions(),
    enabled: options?.enabled ?? true,
  });
}

export function useSuspenseOnboardingAddOns() {
  return useSuspenseQuery(getOnboardingAddOnsQueryOptions());
}
