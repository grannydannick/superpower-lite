import { useCallback, useMemo } from 'react';

import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import type { Product } from '@/types/api';

/**
 * Shared hook that returns a lookup function for resolving a supplement
 * productId (from ProtocolAction.content) to its cheapest marketplace Product.
 *
 * Looks up by `Product.productId` first (cheapest in-stock variant, falling
 * back through more expensive variants if cheaper ones are out of stock),
 * then falls back to a direct `Product.id` match.
 */
export function useSupplementProductLookup() {
  const { data: marketplaceData } = useMarketplace();

  const supplementProducts = useMemo(
    () => marketplaceData?.supplements ?? [],
    [marketplaceData?.supplements],
  );

  // Group all variants by productId, sorted cheapest-first, so the lookup
  // can skip out-of-stock variants and fall back to the next cheapest.
  const variantsByProductId = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of supplementProducts) {
      if (!product.productId) continue;
      const list = map.get(product.productId) ?? [];
      list.push(product);
      map.set(product.productId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.price - b.price);
    }
    return map;
  }, [supplementProducts]);

  const byId = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of supplementProducts) {
      map.set(product.id, product);
    }
    return map;
  }, [supplementProducts]);

  return useCallback(
    (productId?: string): Product | null => {
      if (!productId) return null;

      // Try variants sorted by price, preferring the cheapest in-stock one
      const variants = variantsByProductId.get(productId);
      if (variants) {
        const inStock = variants.find(
          (v) => v.inventoryQuantity === undefined || v.inventoryQuantity > 0,
        );
        if (inStock) return inStock;
        // All variants out of stock — return cheapest so caller can handle OOS
        return variants[0] ?? null;
      }

      return byId.get(productId) ?? null;
    },
    [variantsByProductId, byId],
  );
}
