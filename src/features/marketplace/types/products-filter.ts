import * as z from 'zod';

import {
  DEFAULT_CATEGORY,
  PRODUCT_CATEGORIES,
} from '../const/product-categories';

export const ProductCategorySchema = z
  .enum(PRODUCT_CATEGORIES)
  .default(DEFAULT_CATEGORY)
  .catch(DEFAULT_CATEGORY);

export const ProductsFilterSchema = z.object({
  category: ProductCategorySchema,
  filter: z.string().nullable().default(null).catch(null),
  search: z.string().default('').catch(''),
});

export type ProductsFilter = z.infer<typeof ProductsFilterSchema>;

// Used as the route's validateSearch schema — all fields optional so defaults
// are never written back to the URL by TanStack Router on mount.
export const ProductsFilterRouteSchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional().catch(undefined),
  filter: z.string().optional().catch(undefined),
  search: z.string().optional().catch(undefined),
});

export type ProductsFilterRouteSearch = z.infer<
  typeof ProductsFilterRouteSchema
>;

export function resolveProductsFilter(
  search: ProductsFilterRouteSearch,
): ProductsFilter {
  return ProductsFilterSchema.parse(search);
}
