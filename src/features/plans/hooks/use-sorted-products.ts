import { useMemo } from 'react';

import { Product } from '@/types/api';

interface UseSortedProductsOptions {
  products: Product[] | undefined;
  productIds: string[];
  isProductSelected: (productId: string) => boolean;
}

/**
 * Hook to sort products with selected items first, then unselected items
 *
 * This hook takes a list of products and sorts them so that selected products
 * appear at the top of the list, followed by unselected products. This is useful
 * for checkout flows and product selection interfaces.
 *
 * @param options - Configuration object containing:
 *   - products: Array of products to sort (can be undefined while loading)
 *   - productIds: Array of product IDs to filter by
 *   - isProductSelected: Function to check if a product is selected
 * @returns Sorted array of products filtered by the provided product IDs
 */
export function useSortedProducts({
  products,
  productIds,
  isProductSelected,
}: UseSortedProductsOptions): Product[] {
  return useMemo(() => {
    const filteredProducts =
      products?.filter((p) => productIds.includes(p.id)) ?? [];

    return filteredProducts.sort((a, b) => {
      const aSelected = isProductSelected(a.id);
      const bSelected = isProductSelected(b.id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [products, productIds, isProductSelected]);
}
