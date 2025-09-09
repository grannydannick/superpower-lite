import { useCallback, forwardRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H2 } from '@/components/ui/typography';
import { useProductAvailability } from '@/features/plans/hooks/use-product-availability';
import { useSortedProducts } from '@/features/plans/hooks/use-sorted-products';
import { useCarePlanCart } from '@/features/plans/stores/care-plan-cart-store';
import { useCreateCheckoutUrl } from '@/features/shop/api';
import { cn } from '@/lib/utils';
import { Product } from '@/types/api';

import { calculateTotals } from '../../../utils/calculate-totals';
import { CheckoutPrice } from '../checkout-price';

export const ReviewStep = (): JSX.Element => {
  const { productRequests, availableProducts, isLoading } =
    useProductAvailability();
  const { selectedProducts, addProduct, removeProduct, isProductSelected } =
    useCarePlanCart();

  const createCheckoutUrlMutation = useCreateCheckoutUrl({
    mutationConfig: {
      onSuccess: (data) => {
        window.open(data.checkoutUrl, '_top', 'noreferrer');
      },
    },
  });

  const sortedProducts = useSortedProducts({
    products: availableProducts,
    productIds: productRequests,
    isProductSelected,
  });

  const totals = calculateTotals(selectedProducts);

  const toggleProduct = useCallback(
    (item: Product) => {
      if (isProductSelected(item.id)) {
        removeProduct(item.id);
      } else {
        addProduct(item);
      }
    },
    [addProduct, removeProduct, isProductSelected],
  );

  const handleCheckout = () => {
    // Remove the utm data from the API call
    createCheckoutUrlMutation.mutate({
      data: { products: selectedProducts },
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar scrollbar-thumb-zinc-300 [overflow:overlay] md:px-10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:w-2">
        <div className="flex flex-col gap-1">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => <LoadingSkeleton key={i} />)
            : sortedProducts.map((product) => (
                <ActionPlanProductCheckoutOptionRow
                  key={product.id}
                  item={product}
                  onClick={toggleProduct}
                  checked={isProductSelected(product.id)}
                />
              ))}
        </div>
      </div>

      <div className="flex w-full flex-col-reverse items-center gap-2 border-t border-t-zinc-200 px-10 py-5 md:w-auto md:flex-row md:justify-between">
        <div className="hidden md:block">
          <SavingsBadge totalSavings={totals.totalSavings} />
        </div>
        <CheckoutSummary
          selectedProducts={selectedProducts}
          totals={totals}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
};

interface ActionPlanProductCheckoutOptionRowProps {
  item: Product;
  onClick: (item: Product) => void;
  checked: boolean;
}

const ActionPlanProductCheckoutOptionRow = forwardRef<
  HTMLDivElement,
  ActionPlanProductCheckoutOptionRowProps
>(({ item, onClick, checked }, ref) => {
  const handleClick = () => onClick(item);

  return (
    <div
      ref={ref}
      className={cn(
        'flex cursor-pointer p-5 justify-between w-full items-center rounded-[20px] bg-zinc-100 gap-2',
      )}
      role="presentation"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {item.image ? (
          <img
            alt={item.name}
            src={item.image}
            className="size-16 rounded-[12px] bg-white object-cover object-center"
          />
        ) : (
          <div className="flex  size-16 items-center justify-center rounded-[12px] bg-white">
            <H2 className="text-zinc-500">?</H2>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <Body1 className="line-clamp-1">{item.name}</Body1>
          <CheckoutPrice item={item} />
        </div>
      </div>
      <Checkbox
        checked={checked}
        className="size-5 data-[state=unchecked]:border-zinc-200 data-[state=unchecked]:bg-white"
        onChange={handleClick}
      />
    </div>
  );
});

ActionPlanProductCheckoutOptionRow.displayName =
  'ActionPlanProductCheckoutOptionRow';

const LoadingSkeleton = () => (
  <div className="flex w-full items-center justify-between gap-2 rounded-[20px] bg-zinc-100 p-5">
    <div className="flex items-center gap-4">
      <Skeleton className="size-16 rounded-[12px]" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-[200px]" />
        <Skeleton className="h-5 w-[100px]" />
      </div>
    </div>
    <Skeleton className="size-5 rounded-sm" />
  </div>
);

const SavingsBadge = ({
  totalSavings,
  variant = 'desktop',
}: {
  totalSavings: number;
  variant?: 'mobile' | 'desktop';
}) => {
  if (totalSavings <= 0) return null;

  const text =
    variant === 'mobile'
      ? `Total savings $${totalSavings.toFixed(2)}`
      : `Checkout and save $${totalSavings.toFixed(2)}`;

  return (
    <Badge className="bg-transparent px-3 py-2 md:bg-vermillion-50">
      <Body1 className="text-vermillion-900">{text}</Body1>
    </Badge>
  );
};

const CheckoutSummary = ({
  selectedProducts,
  totals,
  onCheckout,
}: {
  selectedProducts: Product[];
  totals: { total: number; totalSavings: number };
  onCheckout: () => void;
}) => (
  <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
    <DialogClose asChild>
      <Button
        onClick={onCheckout}
        disabled={selectedProducts.length === 0}
        className="order-1 w-full md:order-3 md:w-auto"
      >
        Go to checkout
      </Button>
    </DialogClose>
    <div className="order-3 flex flex-col items-center px-6 md:order-2 md:items-end">
      <Body1 className="text-zinc-500">
        Subtotal ({selectedProducts.length}{' '}
        {selectedProducts.length === 1 ? 'item' : 'items'})
      </Body1>
      <Body1>${totals.total.toFixed(2)}</Body1>
    </div>
    <div className="order-2 md:hidden">
      <SavingsBadge totalSavings={totals.totalSavings} variant="mobile" />
    </div>
  </div>
);
