import { useMemo } from 'react';

import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import type { HealthcareService, Product, Rx } from '@/types/api';

export type MarketplaceProduct = Product | Rx | HealthcareService;

/**
 * Converts a product name to a handle-like format for matching.
 * "Berberine UltraSorb" -> "berberine-ultrasorb"
 */
function nameToHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const normalizeName = (value: string) =>
  value.replace(/[^a-z0-9]/gi, '').toLowerCase();

const namesMatch = (candidate: string, target: string) => {
  const candidateNormalized = normalizeName(candidate);
  const targetNormalized = normalizeName(target);

  if (!candidateNormalized || !targetNormalized) {
    return false;
  }

  return (
    candidateNormalized === targetNormalized ||
    candidateNormalized.includes(targetNormalized) ||
    targetNormalized.includes(candidateNormalized)
  );
};

const normalizeHandle = (value: string) => value.trim().toLowerCase();

const extractHandleFromUrl = (url?: string | null): string | null => {
  if (!url) return null;

  const match = url.match(/\/products?\/([^/?#]+)/i);
  if (match?.[1]) {
    return normalizeHandle(match[1]);
  }

  const marketplaceMatch = url.match(/\/marketplace\/([^/?#]+)/i);
  if (marketplaceMatch?.[1]) {
    return normalizeHandle(marketplaceMatch[1]);
  }

  return null;
};

export interface ProductIndex {
  /** Exact match by handle or ID */
  get(handle: string): MarketplaceProduct | undefined;
  /** Find by product name with fuzzy matching */
  lookupByName(name: string): MarketplaceProduct | undefined;
  /** Check if product name matches target */
  matchesName(product: MarketplaceProduct, name: string): boolean;
  /** Check if handle exists */
  has(handle: string): boolean;
  /** Number of products */
  size: number;
  /** Get all keys (for debugging) */
  keys(): IterableIterator<string>;
}

/**
 * Builds an index mapping product handles/names to their product data.
 * Uses cached marketplace data from React Query.
 *
 * Supports fuzzy matching: if exact handle match fails, tries prefix matching
 * since product names often include quantity (e.g., "Berberine - 60 Capsules"
 * should match handle "berberine").
 *
 * @returns ProductIndex with get/has methods that support fuzzy matching
 */
export function useProductIndex(): ProductIndex {
  const { data } = useMarketplace();

  return useMemo(() => {
    const exactIndex = new Map<string, MarketplaceProduct>();
    const allProducts: Array<{ handle: string; product: MarketplaceProduct }> =
      [];

    if (data) {
      // Index supplements
      for (const product of data.supplements) {
        const handle = nameToHandle(product.name);
        exactIndex.set(handle, product);
        const urlHandle = extractHandleFromUrl(product.url);
        if (urlHandle) {
          exactIndex.set(urlHandle, product);
        }
        exactIndex.set(product.id, product);
        allProducts.push({ handle, product });
      }

      // Index prescriptions
      for (const rx of data.prescriptions) {
        const handle = nameToHandle(rx.name);
        exactIndex.set(handle, rx);
        const urlHandle = extractHandleFromUrl(rx.url);
        if (urlHandle) {
          exactIndex.set(urlHandle, rx);
        }
        exactIndex.set(rx.id, rx);
        allProducts.push({ handle, product: rx });
      }

      // Index services
      for (const service of data.services) {
        const handle = nameToHandle(service.name);
        exactIndex.set(handle, service);
        exactIndex.set(service.id, service);
        allProducts.push({ handle, product: service });
      }
    }

    return {
      get(searchHandle: string): MarketplaceProduct | undefined {
        const normalizedSearch = normalizeHandle(searchHandle);

        // Try exact match first
        const exact =
          exactIndex.get(searchHandle) ?? exactIndex.get(normalizedSearch);
        if (exact) {
          return exact;
        }

        // Try prefix match: find products where handle starts with searchHandle
        // e.g., "berberine" matches "berberine-60-capsules"
        const prefixMatch = allProducts.find(({ handle }) =>
          handle.startsWith(normalizedSearch + '-'),
        );
        if (prefixMatch) {
          return prefixMatch.product;
        }

        // Try reverse prefix match: find products where searchHandle starts with handle
        // e.g., "potassium-citrate-200mg" matches product with handle "potassium-citrate"
        const reversePrefixMatch = allProducts.find(({ handle }) =>
          normalizedSearch.startsWith(handle + '-'),
        );
        if (reversePrefixMatch) {
          return reversePrefixMatch.product;
        }

        // No match found - return undefined (don't show wrong product)
        return undefined;
      },
      lookupByName(name: string): MarketplaceProduct | undefined {
        const target = normalizeName(name);
        if (!target) return undefined;

        // Only return exact name matches to avoid showing wrong products
        const found = allProducts.find(
          ({ product }) => normalizeName(product.name) === target,
        )?.product;

        return found;
      },
      matchesName(product: MarketplaceProduct, name: string): boolean {
        return namesMatch(product.name, name);
      },
      has(searchHandle: string): boolean {
        return this.get(searchHandle) !== undefined;
      },
      get size() {
        return exactIndex.size;
      },
      keys() {
        return exactIndex.keys();
      },
    };
  }, [data]);
}
