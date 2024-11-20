import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { useCreateCheckoutUrl } from '@/features/action-plan/api';
import { CheckoutPrice } from '@/features/action-plan/components/checkout/checkout-price';
import { useCheckout } from '@/features/action-plan/stores/checkout-store';
import { calculateTotals } from '@/features/action-plan/utils/calculate-totals';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

export const CheckoutStep = (): JSX.Element => {
  const createCheckoutUrlMutation = useCreateCheckoutUrl({
    mutationConfig: {
      onSuccess: (data) => {
        window.open(data.checkoutUrl, '_top', 'noreferrer');
      },
    },
  });
  const { selectedProducts } = useCheckout((s) => s);
  const { prevStep } = useStepper((s) => s);

  const totals = calculateTotals(selectedProducts);

  return (
    <>
      <div className="flex flex-col gap-2 px-6 pb-4">
        {selectedProducts.map((selectedProduct, index) => (
          <div
            className="flex w-full items-center justify-between gap-1 p-2"
            key={index}
          >
            <div className="flex items-center gap-4">
              <img
                alt={selectedProduct.name}
                src={selectedProduct.image}
                className="size-14 rounded-[8px] border border-zinc-200 bg-white object-cover object-center"
              />
              <Body1 className="line-clamp-1">{selectedProduct.name}</Body1>
            </div>
            <CheckoutPrice item={selectedProduct} />
          </div>
        ))}
      </div>
      <div
        className={cn(
          'flex w-full flex-col-reverse items-center p-5 border-t border-t-zinc-200 md:w-auto md:flex-row gap-2',
          totals.totalSavings > 0 ? 'md:justify-between' : 'md:justify-end',
        )}
      >
        {!createCheckoutUrlMutation.isSuccess && (
          <>
            {totals.totalSavings > 0 ? (
              <Badge className="hidden bg-vermillion-50 px-3 py-2 md:inline-flex">
                <Body1 className="text-vermillion-900">
                  Checkout and save ${totals.totalSavings.toFixed(2)}
                </Body1>
              </Badge>
            ) : null}
            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
              <Button
                variant="outline"
                onClick={prevStep}
                className="w-full md:w-auto"
              >
                Back
              </Button>
              <Button
                disabled={createCheckoutUrlMutation.isPending}
                onClick={() =>
                  createCheckoutUrlMutation.mutate({
                    data: { products: selectedProducts },
                  })
                }
                className="w-full md:w-auto"
              >
                {createCheckoutUrlMutation.isPending ? <Spinner /> : 'Order'}
              </Button>
            </div>
          </>
        )}
        {createCheckoutUrlMutation.isSuccess && (
          <p className="text-[18px] text-zinc-400">Finish shopify checkout.</p>
        )}
      </div>
    </>
  );
};
