import { useCarePlan } from '@/features/plans/context/care-plan-context';
import { parseProductRequests } from '@/features/plans/utils/parse-product-requests';
import { useProducts } from '@/features/shop/api';
import { Product } from '@/types/api';

interface ProductAvailabilityResult {
  productRequests: string[];
  availableProductCount: number;
  unavailableProductCount: number;
  productCount: number;
  hasProducts: boolean;
  hasAvailableProducts: boolean;
  availableProducts: Product[];
  isLoading: boolean;
}

/**
 * Hook to calculate product availability and counts from a care plan
 *
 * This hook extracts product IDs from care plan activities and checks their availability
 * against the products API data. It considers both product existence and inventory quantity.
 * It provides convenient boolean flags and counts for conditional rendering and display purposes.
 *
 * @returns Object containing:
 *   - productRequests: Array of product IDs from the care plan
 *   - availableProductCount: Number of products that exist and have inventory > 0
 *   - unavailableProductCount: Number of products that don't exist or have no inventory
 *   - productCount: Total number of product requests
 *   - hasProducts: Whether there are any product requests
 *   - hasAvailableProducts: Whether there are any available products
 *   - availableProducts: Array of available products (products that exist and have inventory > 0)
 *   - isLoading: Whether the products are still loading
 * @throws Error if used outside of CarePlanProvider
 */
export function useProductAvailability(): ProductAvailabilityResult {
  const { plan } = useCarePlan();
  const { data: productsData, isLoading } = useProducts({});

  const productRequests = parseProductRequests(plan.activity ?? []);

  const hasProducts = Boolean(
    plan.activity && plan.activity.length > 0 && productRequests.length > 0,
  );

  const availableProducts =
    productsData?.products?.filter(
      (p) =>
        productRequests.includes(p.id) &&
        // For backward compatibility: if inventoryQuantity is undefined/null, consider it in stock
        (p.inventoryQuantity === undefined ||
          p.inventoryQuantity === null ||
          p.inventoryQuantity > 0),
    ) ?? [];

  const hasAvailableProducts = availableProducts.length > 0;
  const productCount = productRequests.length;
  const unavailableProductCount = productCount - availableProducts.length;

  return {
    productRequests,
    availableProductCount: availableProducts.length,
    unavailableProductCount,
    productCount,
    hasProducts,
    hasAvailableProducts,
    availableProducts,
    isLoading,
  };
}
