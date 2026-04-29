import { useQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

type OnboardingProductsResponse =
  operations['onboarding.getOnboardingProducts']['responses'][200]['content']['application/json'];

export type OnboardingProduct = OnboardingProductsResponse['products'][number];

/** Slugs fetched once for the advanced-upgrade bundle picker accordion copy. */
export const BUNDLE_PICKER_PRODUCT_SLUGS: string[] = [
  'advanced-blood-panel',
  'gut-microbiome-analysis',
  'heavy-metals',
  'mycotoxins',
  'environmental-toxins',
];

export function getOnboardingProductsQueryOptions(input: { slugs: string[] }) {
  return $api.queryOptions('get', '/rpc/onboarding/products', {
    params: {
      query: {
        slugs: input.slugs,
      },
    },
  });
}

export function useOnboardingProducts(input: { slugs: string[] }) {
  return useQuery(getOnboardingProductsQueryOptions(input));
}
