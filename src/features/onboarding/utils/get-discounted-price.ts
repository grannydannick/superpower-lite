import { AvailableSubscription } from '@/types/api';

export const getDiscountedPrice = (subscription?: AvailableSubscription) => {
  if (!subscription) return null;

  if (!subscription.coupon) return null;

  if (subscription.coupon?.amount_off) {
    if (subscription.coupon.amount_off >= subscription.subtotal) {
      return '100%';
    }

    return `- $${subscription.coupon.amount_off / 100}`;
  } else if (subscription.coupon?.percent_off) {
    return `${subscription.coupon.percent_off}%`;
  }

  return null;
};
