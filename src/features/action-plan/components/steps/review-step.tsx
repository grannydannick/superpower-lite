import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useStepper } from '@/components/ui/stepper';
import { useProducts } from '@/features/action-plan/api';
import { useCheckout } from '@/features/action-plan/stores/checkout-store';
import { Product } from '@/types/api';

export const ReviewStep = (): JSX.Element => {
  const { nextStep } = useStepper((s) => s);
  const productsQuery = useProducts();
  const { selectedProducts, goals } = useCheckout((s) => s);
  const products = productsQuery.data?.products ?? [];

  const total = selectedProducts
    .reduce((price, product) => price + Number(product.price), 0)
    .toFixed(2);

  return (
    <>
      <div className="flex flex-col gap-3 px-4 py-0 md:gap-6 md:px-8 md:py-6">
        {goals.map((goal, index) => {
          // Filter goalItems to include only those with itemType 'PRODUCT'
          const productGoalItems = goal.goalItems.filter(
            (goalItem) => goalItem.itemType === 'PRODUCT',
          );

          // Proceed to render only if there are productGoalItems
          if (productGoalItems.length > 0) {
            return (
              <div className="flex flex-col gap-1" key={index}>
                <h4 className="mb-2 text-[16px] font-light text-[#A1A1AA]">
                  {goal.title.length ? goal.title : `Goal ${index + 1}`}
                </h4>
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
      <div className="flex items-center justify-end gap-6 px-7 pb-4 pt-7 md:px-14 md:pb-8 md:pt-14">
        <div>
          <p className="text-[16px] text-zinc-500">
            {selectedProducts.length} items
          </p>
          <p className="text-[16px] text-zinc-500">${total}</p>
        </div>
        <Button onClick={nextStep} disabled={selectedProducts.length === 0}>
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

  if (!item) return <></>;
  const onItemClick = (): void => {
    setChecked((prev) => !prev);

    updateSelectedProducts(item);
  };

  return (
    <div
      className={`flex cursor-pointer flex-col justify-between rounded-lg hover:bg-[#F4F4F4] ${
        checked ? 'bg-[#F7F7F7]' : 'border-transparent'
      }`}
      role="presentation"
      onClick={onItemClick}
    >
      <div className="flex items-center gap-3 rounded-2xl p-3 md:gap-5 md:p-6">
        <img
          alt={item.name}
          src={item.image}
          className="size-[64px] rounded-[12px] border-2 border-solid border-[#E4E4E7] bg-white object-cover object-center"
        />
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-3">
            <h4 className="text-base leading-[150%] text-[#18181B]">
              {item.name}
            </h4>
            <div>
              <h4 className="text-base leading-[133%] text-[#FC5F2B]">
                ${item.price}
              </h4>
            </div>
          </div>
          <Checkbox checked={checked} className="size-5" />
        </div>
      </div>
    </div>
  );
};
