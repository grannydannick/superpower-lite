import { Product } from '@/types/api';

import { calculateDiscountedPrice } from './calculate-discount';

/**
 * Calculates the total and total savings for selected products.
 * @param {Product[]} products - Array of product objects with price and discount.
 * @returns {{ total: number, totalSavings: number }} - Contains total and totalSavings.
 */
export const calculateTotals = (
  products: Product[],
): { total: number; totalSavings: number } => {
  return products.reduce(
    (acc, product) => {
      const discountPercentage = product.discount;
      const originalPrice = product.price;

      const validDiscount =
        discountPercentage < 0 || discountPercentage > 100
          ? 0
          : discountPercentage;

      const discountedPrice = calculateDiscountedPrice(
        originalPrice,
        validDiscount,
      );
      const savings = originalPrice - discountedPrice;

      acc.total += discountedPrice;
      acc.totalSavings += savings;

      return acc;
    },
    { total: 0, totalSavings: 0 },
  );
};
