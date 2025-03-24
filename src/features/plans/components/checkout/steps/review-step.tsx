import { useState, useCallback, forwardRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, H2 } from '@/components/ui/typography';
import { useCarePlan } from '@/features/plans/context/care-plan-context';
import { cn } from '@/lib/utils';
import { Product } from '@/types/api';

import { useCreateCheckoutUrl, useProducts } from '../../../api';
import { calculateTotals } from '../../../utils/calculate-totals';
import { parseProductRequests } from '../../../utils/parse-product-requests';
import { CheckoutPrice } from '../checkout-price';

export const ReviewStep = (): JSX.Element => {
  const { plan } = useCarePlan();
  const getProductsQuery = useProducts({});

  const productRequests = parseProductRequests(plan.activity ?? []);

  const createCheckoutUrlMutation = useCreateCheckoutUrl({
    mutationConfig: {
      onSuccess: (data) => {
        window.open(data.checkoutUrl, '_top', 'noreferrer');
      },
    },
  });

  const products =
    getProductsQuery.data?.products.filter((p) =>
      productRequests.includes(p.id),
    ) ?? [];

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const totals = calculateTotals(selectedProducts);

  const toggleProduct = useCallback((item: Product) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.some((product) => product.id === item.id);
      return isSelected
        ? prevSelected.filter((product) => product.id !== item.id)
        : [...prevSelected, item];
    });
  }, []);

  const handleCheckout = () => {
    createCheckoutUrlMutation.mutate({
      data: { products: selectedProducts },
    });
  };

  return (
    <>
      <div className="mr-1 flex max-h-[50vh] flex-col gap-1 overflow-y-auto px-6 py-4 scrollbar scrollbar-thumb-zinc-300 [overflow:overlay] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:w-2">
        {getProductsQuery.isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => <LoadingSkeleton key={i} />)
          : products.map((product) => (
              <ActionPlanProductCheckoutOptionRow
                key={product.id}
                item={product}
                onClick={toggleProduct}
                checked={selectedProducts.some((p) => p.id === product.id)}
              />
            ))}
      </div>

      <div
        className={cn(
          'flex w-full flex-col-reverse items-center p-5 border-t border-t-zinc-200 md:w-auto md:flex-row gap-2',
          totals.totalSavings > 0 ? 'md:justify-between' : 'md:justify-end',
        )}
      >
        <SavingsBadge totalSavings={totals.totalSavings} />
        <CheckoutSummary
          selectedProducts={selectedProducts}
          totals={totals}
          onCheckout={handleCheckout}
        />
      </div>
    </>
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

const SavingsBadge = ({ totalSavings }: { totalSavings: number }) => {
  if (totalSavings <= 0) return null;

  return (
    <Badge className="hidden bg-vermillion-50 px-3 py-2 md:inline-flex">
      <Body1 className="text-vermillion-900">
        Checkout and save ${totalSavings.toFixed(2)}
      </Body1>
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
    <div className="flex flex-col items-center md:items-end">
      <Body1 className="text-zinc-500">
        Subtotal ({selectedProducts.length}{' '}
        {selectedProducts.length === 1 ? 'item' : 'items'})
      </Body1>
      <Body1>${totals.total.toFixed(2)}</Body1>
    </div>
    <DialogClose asChild>
      <Button
        onClick={onCheckout}
        disabled={selectedProducts.length === 0}
        className="w-full md:w-auto"
      >
        Go to checkout
      </Button>
    </DialogClose>
  </div>
);
