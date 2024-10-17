import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useProducts } from '@/features/action-plan/api';
import { useCheckout } from '@/features/action-plan/stores/checkout-store';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useStepper } from '@/lib/stepper';
import { Product } from '@/types/api';

export const ReviewStep = (): JSX.Element => {
  const { nextStep } = useStepper((s) => s);
  const productsQuery = useProducts();
  const goals = usePlan((s) => s.goals);
  const { selectedProducts } = useCheckout((s) => s);
  const products = productsQuery.data?.products ?? [];

  const total = selectedProducts
    .reduce((price, product) => price + Number(product.price), 0)
    .toFixed(2);

  return (
    <>
      <div className="px-6 py-2.5 md:hidden">
        <H2>Checkout</H2>
      </div>
      <div className="flex max-h-[50vh] flex-col gap-6 overflow-auto p-6">
        {goals
          .filter((g) => g.type === 'ANNUAL_REPORT_PROTOCOLS')
          .map((goal, index) => {
            const productGoalItems = goal.goalItems
              .filter((goalItem) => goalItem.itemType === 'PRODUCT')
              /**
               * Semi weird hack to fix display of old products that are no longer available on marketplace in action plans
               */
              .filter((productGoalItem) =>
                products.some(
                  (product) => product.id === productGoalItem.itemId,
                ),
              );

            if (productGoalItems.length > 0) {
              return (
                <div className="flex flex-col gap-4" key={index}>
                  <Body1 className="px-6 text-zinc-500">
                    {goal.title.length ? goal.title : `Goal ${index + 1}`}
                  </Body1>
                  {productGoalItems.map((goalItem, index) => (
                    <ActionPlanProductCheckoutOptionRow
                      key={index}
                      item={products.find(
                        (product) => product.id === goalItem.itemId,
                      )}
                      initiallyChecked={
                        !!selectedProducts?.find(
                          (product) => product.id === goalItem.itemId,
                        )
                      }
                    />
                  ))}
                </div>
              );
            }

            // If no products, return null or any other placeholder
            return null;
          })}
      </div>
      <div className="mt-4 flex w-full flex-col-reverse items-center gap-6 px-6 pb-14 pt-4 md:w-auto md:flex-row md:justify-end md:px-14 md:pt-0">
        <div className="flex flex-col items-center md:items-end">
          <Body1 className="text-zinc-500">
            Subtotal ({selectedProducts.length} items)
          </Body1>
          <Body1>${total}</Body1>
        </div>
        <Button
          onClick={nextStep}
          disabled={selectedProducts.length === 0}
          className="w-full md:w-auto"
        >
          Go to checkout
        </Button>
      </div>
    </>
  );
};

const ActionPlanProductCheckoutOptionRow = ({
  item,
  initiallyChecked,
}: {
  item?: Product;
  initiallyChecked: boolean;
}) => {
  const [checked, setChecked] = useState(initiallyChecked);
  const { updateSelectedProducts } = useCheckout((s) => s);

  if (!item) return null;

  const onItemClick = (): void => {
    setChecked((prev) => !prev);

    updateSelectedProducts(item);
  };

  return (
    <div
      className={`flex cursor-pointer flex-col justify-between rounded-2xl hover:bg-zinc-50 ${
        checked ? 'bg-zinc-50' : 'border-transparent'
      }`}
      role="presentation"
      onClick={onItemClick}
    >
      <div className="flex items-center gap-5 rounded-2xl p-3 md:gap-5 md:p-6">
        <img
          alt={item.name}
          src={item.image}
          className="size-[64px] rounded-[12px] border-2 border-solid border-zinc-200 bg-white object-cover object-center"
        />
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-1">
            <Body1>{item.name}</Body1>
            <div>
              <Body2>${item.price}</Body2>
            </div>
          </div>
          <Checkbox checked={checked} className="size-5" />
        </div>
      </div>
    </div>
  );
};
