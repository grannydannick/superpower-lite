import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useStepper } from '@/components/ui/stepper';
import { useCreateCheckoutUrl } from '@/features/action-plan/api';
import { useCheckout } from '@/features/action-plan/stores/checkout-store';
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
      <div className="flex flex-col px-4 py-3 md:px-8 md:py-6">
        {selectedProducts.map((selectedProduct, index) => (
          <div
            className="flex w-full items-center justify-between px-2 py-3 md:px-6"
            key={index}
          >
            <div className="flex items-center gap-4">
              <img
                alt={selectedProduct.name}
                src={selectedProduct.image}
                className="size-10 rounded-[8px] border-2 border-solid border-[#E4E4E7] bg-white object-cover object-center"
              />
              <h4 className="text-[14px] leading-[142%] text-[#18181B]">
                {selectedProduct.name}
              </h4>
            </div>
            <h4 className="text-[14px] leading-[142%] text-[#FC5F2B]">
              ${selectedProduct.price}
            </h4>
          </div>
        ))}
      </div>
      <div className="grid w-full grid-cols-2 px-10 md:px-14">
        <div className="flex flex-col gap-6" style={{ gridColumn: 2 }}>
          {checkoutInfo.map((ci, index) => (
            <div className="flex justify-between gap-5 md:gap-20" key={index}>
              <h4
                className={`text-sm leading-[150%] md:text-[18px] ${ci.text}`}
              >
                {ci.title}:
              </h4>
              <h4
                className={`text-sm leading-[150%] md:text-[18px] ${ci.text}`}
              >
                ${ci.data.toFixed(2)}
              </h4>
            </div>
          ))}
        </div>
      </div>
      <div
        className={cn(
          'flex items-center justify-between gap-6 px-7 pb-4 pt-7 md:px-14 md:pb-8 md:pt-14',
          createCheckoutUrlMutation.isSuccess ? 'justify-end' : null,
        )}
      >
        {!createCheckoutUrlMutation.isSuccess && (
          <>
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button
              disabled={createCheckoutUrlMutation.isPending}
              onClick={() =>
                createCheckoutUrlMutation.mutate({ data: selectedProducts })
              }
            >
              {createCheckoutUrlMutation.isPending ? (
                <Spinner />
              ) : (
                'Place order'
              )}
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
