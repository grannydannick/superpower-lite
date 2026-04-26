import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

import { marketplaceSummaryQueryOptions } from './marketplace-summary';

type MarketplaceSummary =
  operations['marketplace.summary']['responses'][200]['content']['application/json'];

type MarketplaceProductResponse =
  operations['marketplace.getProduct']['responses'][200]['content']['application/json'];

// Temporarily using the summary endpoint for product listing to reduce server load —
// it returns all products in a single cached response instead of a paginated query.
export const marketplaceProductsQueryOptions = () => ({
  ...marketplaceSummaryQueryOptions(),
  select: (data: MarketplaceSummary) => ({
    items: data.products,
    total: data.products.length,
  }),
});

export const marketplaceProductBySlugQueryOptions = (
  slug: string | null | undefined,
) =>
  $api.queryOptions(
    'get',
    '/marketplace/products/{slug}',
    { params: { path: { slug: slug ?? '' } } },
    { enabled: !!slug, select: (data) => data.product },
  );

export const useMarketplaceProducts = () => {
  const queryClient = useQueryClient();
  const query = useQuery({ ...marketplaceProductsQueryOptions() });

  useEffect(() => {
    const summary = queryClient.getQueryData<MarketplaceSummary>(
      marketplaceSummaryQueryOptions().queryKey,
    );
    if (!summary?.products) return;
    for (const product of summary.products) {
      queryClient.setQueryData<MarketplaceProductResponse>(
        marketplaceProductBySlugQueryOptions(product.slug).queryKey,
        (existing) => existing ?? { product },
      );
    }
  }, [query.data, queryClient]);

  return query;
};

export type MarketplaceProductsQuery = ReturnType<
  typeof useMarketplaceProducts
>;

export const useMarketplaceProduct = (slug: string | null | undefined) =>
  useQuery(marketplaceProductBySlugQueryOptions(slug));
export type MarketplaceProductQuery = ReturnType<typeof useMarketplaceProduct>;
export type MarketplaceProduct = NonNullable<MarketplaceProductQuery['data']>;

const marketplaceProductContentQueryOptions = (slug?: string) =>
  $api.queryOptions(
    'get',
    '/marketplace/products/{slug}/content',
    {
      params: { path: { slug: slug ?? '' } },
    },
    {
      enabled: !!slug,
      select: (data) => data.product,
    },
  );

export const useProductByLegacyServiceId = (serviceId: string) => {
  return useQuery(
    $api.queryOptions(
      'get',
      '/marketplace/products/by-legacy-service-id/{serviceId}',
      { params: { path: { serviceId } } },
      { select: (data) => data.product },
    ),
  );
};

export const useMarketplaceProductContent = (
  slug: string | null | undefined,
) => {
  return useQuery({
    ...marketplaceProductContentQueryOptions(slug ?? undefined),
  });
};
export type MarketplaceProductContentQuery = ReturnType<
  typeof useMarketplaceProductContent
>;
export type MarketplaceProductContent = NonNullable<
  MarketplaceProductContentQuery['data']
>;

export const useMarketplaceProductBiomarkers = (slug: string) =>
  useQuery(
    $api.queryOptions('get', '/marketplace/products/{slug}/biomarkers', {
      params: { path: { slug } },
    }),
  );
