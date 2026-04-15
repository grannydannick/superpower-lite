import { useCallback, useMemo } from 'react';

import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import type { Product } from '@/types/api';

import { SUPPLEMENT_ALTERNATIVES } from '../data/supplement-alternatives';

/**
 * Shared hook that returns a lookup function for resolving a supplement
 * productId (from ProtocolAction.content) to its cheapest marketplace Product.
 *
 * Looks up by `Product.productId` first (cheapest in-stock variant, falling
 * back through more expensive variants if cheaper ones are out of stock),
 * then falls back to a direct `Product.id` match.
 *
 * When all variants of a product are out of stock, the hook consults a static
 * alternatives mapping and returns the first in-stock alternative product.
 */
export function useSupplementProductLookup() {
  const { data: marketplaceData, isLoading: isMarketplaceLoading } =
    useMarketplace();

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

  const isInStock = useCallback(
    (product: Product) =>
      product.inventoryQuantity === undefined || product.inventoryQuantity > 0,
    [],
  );

  /** Find cheapest in-stock variant for a given productId. */
  const findInStockVariant = useCallback(
    (productId: string): Product | null => {
      const variants = variantsByProductId.get(productId);
      if (!variants) return null;
      return variants.find(isInStock) ?? null;
    },
    [variantsByProductId, isInStock],
  );

  /** Try each alternative for an OOS product, return first in-stock match. */
  const findAlternative = useCallback(
    (originalProductId: string): Product | null => {
      const alternativeIds = SUPPLEMENT_ALTERNATIVES[originalProductId];
      if (!alternativeIds) return null;

      for (const altProductId of alternativeIds) {
        const inStock = findInStockVariant(altProductId);
        if (inStock) return inStock;
      }
      return null;
    },
    [findInStockVariant],
  );

  const lookup = useCallback(
    (productId?: string): Product | null => {
      if (!productId) return null;

      // Try variants sorted by price, preferring the cheapest in-stock one
      const variants = variantsByProductId.get(productId);
      if (variants) {
        const inStock = variants.find(isInStock);
        if (inStock) return inStock;

        // All variants OOS — try alternatives
        const alternative = findAlternative(productId);
        if (alternative) return alternative;

        // No alternatives in stock — return cheapest so caller can handle OOS
        return variants[0] ?? null;
      }

      // Product is absent from marketplace data (e.g. delisted) — still try
      // the hardcoded alternatives before giving up.
      const alternative = findAlternative(productId);
      if (alternative) return alternative;

      return byId.get(productId) ?? null;
    },
    [variantsByProductId, byId, isInStock, findAlternative],
  );

  return { lookup, isMarketplaceLoading };
}
