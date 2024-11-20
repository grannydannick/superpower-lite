import { SubscriptionPrice } from '@/types/api';

export const getDiscountedPrice = (price?: SubscriptionPrice) => {
  if (!price) return null;

  if (!price.coupon) return null;

  if (price.coupon?.amount_off) {
    return `- $${price.coupon.amount_off / 100}`;
  } else if (price.coupon?.percent_off) {
    return `${price.coupon.percent_off}%`;
  }

  return null;
};
