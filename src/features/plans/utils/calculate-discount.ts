/**
 * Calculates the discounted price based on original price and discount percentage.
 * @param {number} price - The original price.
 * @param {number} discountPercentage - The discount percentage (0-100).
 * @returns {number} - The discounted price.
 */
export const calculateDiscountedPrice = (
  price: number,
  discountPercentage: number,
): number => {
  if (discountPercentage === 0) {
    return price;
  }

  return price * (1 - discountPercentage / 100);
};
