import { IconCheckmark1Small } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCheckmark1Small';
import { IconPencil } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPencil';

import { Button } from '@/components/ui/button';
import { Body1, Body2, Body3 } from '@/components/ui/typography';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { PaymentMethodsSelect } from '@/features/users/components/payment/payment-methods-select';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/format';

export const CurrentPaymentMethodCard = ({
  error,
  className,
  disableFlexOptions,
}: {
  error?: string;
  className?: string;
  disableFlexOptions?: boolean;
}) => {
  const {
    activePaymentMethod,
    isFlexSelected,
    isSelectingPaymentMethod,
    startSelectingPaymentMethod,
  } = usePaymentMethodSelection();

  if (isSelectingPaymentMethod) {
    return <PaymentMethodsSelect disableFlexOptions={disableFlexOptions} />;
  }

  const showFlexError = disableFlexOptions && isFlexSelected;
  return (
    <div className="space-y-2">
      <div
        className={cn(
          'w-full rounded-2xl border bg-white px-5 py-4',
          error || showFlexError
            ? 'border-pink-700 bg-pink-50'
            : 'border-zinc-200',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Body2
              className={cn(
                error || showFlexError ? 'text-pink-700' : 'text-zinc-500',
                'mb-1',
              )}
            >
              Payment method
            </Body2>

            <div className="flex min-w-0 items-center gap-2">
              {activePaymentMethod?.type === 'card' &&
              activePaymentMethod.card != null ? (
                <Body1 className="truncate text-zinc-900">
                  {capitalize(activePaymentMethod.card.brand)} ****
                  {activePaymentMethod.card.last4}
                </Body1>
              ) : activePaymentMethod?.type === 'klarna' ? (
                <>
                  <img
                    src="/settings/membership/klarna.webp"
                    alt="Klarna"
                    className="h-6 w-auto rounded-md object-contain"
                  />
                  <Body1 className="truncate text-primary">
                    Pay with Klarna
                  </Body1>
                </>
              ) : activePaymentMethod?.type === 'link' ? (
                <>
                  <img
                    src="/settings/membership/link.png"
                    alt="Link"
                    className="h-4 w-auto"
                  />
                  <Body1 className="truncate leading-none text-primary">
                    Pay with Link
                  </Body1>
                </>
              ) : null}
              {isFlexSelected && (
                <div className="flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-1">
                  <IconCheckmark1Small className="size-3 text-secondary" />
                  <Body3 className="leading-none text-secondary">HSA/FSA</Body3>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={startSelectingPaymentMethod}
          >
            <IconPencil className="size-4 cursor-pointer text-zinc-500" />
          </Button>
        </div>
      </div>

      {showFlexError ? (
        <Body2 className="text-pink-700">
          Sorry, HSA/FSA cards are currently not supported for this purchase.
          Please select a different payment method.
        </Body2>
      ) : error ? (
        <Body2 className="text-pink-700">{error}</Body2>
      ) : null}
    </div>
  );
};
