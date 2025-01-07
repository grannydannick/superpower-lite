import React, { useState, useCallback, forwardRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogClose } from '@/components/ui/dialog';
import { Body1 } from '@/components/ui/typography';
import { useCreateCheckoutUrl, useProducts } from '@/features/action-plan/api';
import { CheckoutPrice } from '@/features/action-plan/components/checkout/checkout-price';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { calculateTotals } from '@/features/action-plan/utils/calculate-totals';
import { cn } from '@/lib/utils';
import { Product } from '@/types/api';

export const ReviewStep = (): JSX.Element => {
  const productsQuery = useProducts();
  const createCheckoutUrlMutation = useCreateCheckoutUrl({
    mutationConfig: {
      onSuccess: (data) => {
        window.open(data.checkoutUrl, '_top', 'noreferrer');
      },
    },
  });
  const { goals } = usePlan(useShallow((s) => s));

  const products = productsQuery.data?.products ?? [];
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const totals = calculateTotals(selectedProducts);

  const toggleProduct = useCallback((item: Product) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.some((product) => product.id === item.id);
      if (isSelected) {
        return prevSelected.filter((product) => product.id !== item.id);
      } else {
        return [...prevSelected, item];
      }
    });
  }, []);

  return (
    <>
      <div className="flex max-h-[50vh] flex-col gap-6 overflow-auto py-4">
        {goals.map((goal, goalIndex) => {
          const productGoalItems = goal.goalItems.filter(
            (goalItem) => goalItem.itemType === 'PRODUCT',
          );

          if (productGoalItems.length === 0) return null;

          return (
            <div className="flex flex-col gap-4" key={goal.id || goalIndex}>
              <Body1 className="px-10 text-zinc-500">
                {goal.title.trim() ? goal.title : `Goal ${goalIndex + 1}`}
              </Body1>
              <div className="flex flex-col gap-1 px-6">
                {productGoalItems.map((goalItem) => {
                  const product = products.find(
                    (p) => p.id === goalItem.itemId,
                  );
                  if (!product) return null;

                  const isChecked = selectedProducts.some(
                    (p) => p.id === product.id,
                  );

                  return (
                    <ActionPlanProductCheckoutOptionRow
                      key={product.id}
                      item={product}
                      onClick={toggleProduct}
                      checked={isChecked}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div
        className={cn(
          'flex w-full flex-col-reverse items-center p-5 border-t border-t-zinc-200 md:w-auto md:flex-row gap-2',
          totals.totalSavings > 0 ? 'md:justify-between' : 'md:justify-end',
        )}
      >
        {totals.totalSavings > 0 ? (
          <Badge className="hidden bg-vermillion-50 px-3 py-2 md:inline-flex">
            <Body1 className="text-vermillion-900">
              Checkout and save ${totals.totalSavings.toFixed(2)}
            </Body1>
          </Badge>
        ) : null}
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
              onClick={() =>
                createCheckoutUrlMutation.mutate({
                  data: { products: selectedProducts },
                })
              }
              disabled={selectedProducts.length === 0}
              className="w-full md:w-auto"
            >
              Go to checkout
            </Button>
          </DialogClose>
        </div>
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
  const handleClick = () => {
    onClick(item);
  };

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
        <img
          alt={item.name}
          src={item.image}
          className="size-16 rounded-[12px] bg-white object-cover object-center"
        />

        <div className="flex flex-col gap-1">
          <Body1 className="line-clamp-1">{item.name}</Body1>
          <div>
            <CheckoutPrice item={item} />
          </div>
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
