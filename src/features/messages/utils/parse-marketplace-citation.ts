import { TOTAL_TOXIN_TEST_ID } from '@/const/services';

import type { ProductIndex } from '../hooks/use-product-index';
import type { CitationInfo } from '../types/message-parts';

/**
 * Product IDs that should not be displayed as rich cards.
 */
const EXCLUDED_PRODUCT_IDS = new Set([TOTAL_TOXIN_TEST_ID]);

export interface ParsedMarketplaceCitation {
  type: 'marketplace:product';
  productHandle: string;
  productName?: string;
  vendor?: string;
}

/**
 * Attempts to parse a citation as a Marketplace product reference.
 * Returns null if the citation is not a marketplace product.
 *
 * Expected source formats:
 *   - "product://product-handle" (new format)
 *   - "marketplace://product/product-handle" (legacy format)
 * Expected title format: "Product Name (Vendor)" or just "Product Name"
 */
export function parseMarketplaceCitation(
  citation: CitationInfo,
): ParsedMarketplaceCitation | null {
  // Match pattern: "product://handle" or "marketplace://product/handle"
  // Handle can contain any characters except closing parenthesis (for URL safety)
  const newFormatMatch = citation.source.match(/^product:\/\/(.+)$/i);
  const legacyMatch = citation.source.match(/^marketplace:\/\/product\/(.+)$/i);
  const match = newFormatMatch || legacyMatch;
  if (!match) return null;

  // URL-decode the handle in case it contains encoded characters
  let productHandle: string;
  try {
    productHandle = decodeURIComponent(match[1].trim());
  } catch {
    // Handle malformed percent-encoding gracefully
    return null;
  }

  // Filter out excluded products (e.g., Total Toxins)
  if (EXCLUDED_PRODUCT_IDS.has(productHandle)) {
    return null;
  }

  // Try to parse title: "Product Name (Vendor)"
  const titleMatch = citation.title.match(/^(.+?)\s*\(([^)]+)\)$/);

  return {
    type: 'marketplace:product',
    productHandle,
    productName: titleMatch?.[1]?.trim() ?? citation.title,
    vendor: titleMatch?.[2]?.trim(),
  };
}

/**
 * Returns true if the citation is a marketplace product citation.
 */
export function isMarketplaceCitation(source: string): boolean {
  return (
    source.startsWith('product://') ||
    source.startsWith('marketplace://product/')
  );
}

export function resolveMarketplaceProduct(
  parsed: ParsedMarketplaceCitation,
  productIndex: ProductIndex,
) {
  const productFromHandle = productIndex.get(parsed.productHandle);
  const productName = parsed.productName?.trim();

  if (!productName) {
    return productFromHandle;
  }

  const productFromName = productIndex.lookupByName(productName);

  if (
    productFromHandle &&
    productIndex.matchesName(productFromHandle, productName)
  ) {
    return productFromHandle;
  }

  return productFromName ?? productFromHandle;
}
