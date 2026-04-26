import type { ProductTableRow } from '../types/product-table-row';

export function getProductPageLink(product: ProductTableRow): string {
  if (product.type === 'prescription' && product.legacy?.id) {
    return `/prescriptions/${product.legacy?.id}`;
  }
  return `/marketplace/products/${product.slug}`;
}
