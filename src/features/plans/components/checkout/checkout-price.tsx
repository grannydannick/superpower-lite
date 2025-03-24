import { Body2, Body3 } from '@/components/ui/typography';
import { Product } from '@/types/api';

import { calculateDiscountedPrice } from '../../utils/calculate-discount';

export const CheckoutPrice = ({ item }: { item: Product }) => {
  const discountedPrice = calculateDiscountedPrice(item.price, item.discount);

  return item.discount === 0 ? (
    <Body2 className="text-nowrap">${item.price}</Body2>
  ) : (
    <div className="flex items-baseline gap-2">
      <Body2 className="text-nowrap">${discountedPrice.toFixed(2)}</Body2>
      <Body2 className="hidden text-vermillion-900 sm:block">
        -{item.discount}%
      </Body2>
      <Body3 className="text-nowrap text-zinc-500 line-through">
        ${item.price}
      </Body3>
    </div>
  );
};
