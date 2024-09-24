import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useCreateCheckoutUrl } from '@/features/action-plan/api';
import { useCheckout } from '@/features/action-plan/stores/checkout-store';
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
  const shipping = Number('0');
  const total = selectedProducts
    ? selectedProducts.reduce(
        (price, product) => price + Number(product.price),
        0,
      )
    : 0;
  const subtotal = total - Number(shipping);

  const checkoutInfo = [
    { title: 'Subtotal', data: subtotal, text: 'text-[#A6A6A6]' },
    { title: 'Total', data: total, text: 'text-[#18181B]' },
  ];

  return (
    <>
      <div className="px-6 py-2.5 md:hidden">
        <H2>Checkout</H2>
      </div>
      <div className="flex flex-col p-6 md:px-8">
        {selectedProducts.map((selectedProduct, index) => (
          <div
            className="flex w-full items-center justify-between md:px-6 md:py-3"
            key={index}
          >
            <div className="flex items-center gap-4">
              <img
                alt={selectedProduct.name}
                src={selectedProduct.image}
                className="size-10 rounded-[8px] border border-solid border-[#E4E4E7] bg-white object-cover object-center"
              />
              <Body1>{selectedProduct.name}</Body1>
            </div>
            <Body2>${selectedProduct.price}</Body2>
          </div>
        ))}
      </div>
      <div className="w-full px-6 md:grid md:grid-cols-2 md:px-14">
        <div className="flex flex-col gap-6" style={{ gridColumn: 2 }}>
          {checkoutInfo.map((ci, index) => (
            <div className="flex justify-between gap-5 md:gap-20" key={index}>
              <Body1 className={`${ci.text}`}>{ci.title}:</Body1>
              <Body1 className={`${ci.text}`}>${ci.data.toFixed(2)}</Body1>
            </div>
          ))}
        </div>
      </div>
      <div
        className={cn(
          'flex w-full flex-col-reverse items-center gap-2 md:gap-6 px-6 py-14 md:px-14 md:w-auto md:flex-row md:justify-end',
        )}
      >
        {!createCheckoutUrlMutation.isSuccess && (
          <>
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
                createCheckoutUrlMutation.mutate({ data: selectedProducts })
              }
              className="w-full md:w-auto"
            >
              {createCheckoutUrlMutation.isPending ? <Spinner /> : 'Order'}
            </Button>
          </>
        )}
        {createCheckoutUrlMutation.isSuccess && (
          <p className="text-[18px] text-zinc-400">Finish shopify checkout.</p>
        )}
      </div>
    </>
  );
};
