import { CircleCheckBig, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Body1, Body2, Body3 } from '@/components/ui/typography';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { PaymentMethodsSelect } from '@/features/users/components/payment/payment-methods-select';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/format';

export const CurrentPaymentMethodCard = ({
  error,
  className,
}: {
  error?: string;
  className?: string;
}) => {
  const {
    activePaymentMethod,
    isFlexSelected,
    isSelectingPaymentMethod,
    startSelectingPaymentMethod,
  } = usePaymentMethodSelection();

  if (isSelectingPaymentMethod) {
    return <PaymentMethodsSelect />;
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'w-full space-y-3 rounded-2xl border bg-white px-8 py-6',
          error ? 'border-pink-700 bg-pink-50' : 'border-zinc-200',
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <Body2 className={cn(error ? 'text-pink-700' : 'text-zinc-500')}>
            Payment method
          </Body2>

          <Button
            variant="ghost"
            size="icon"
            onClick={startSelectingPaymentMethod}
          >
            <Pencil className="size-4 cursor-pointer text-zinc-500" />
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            {activePaymentMethod?.type === 'card' &&
            activePaymentMethod.card ? (
              <>
                <Body1>{capitalize(activePaymentMethod.card.brand)}</Body1>
                <Body1>****{activePaymentMethod.card.last4}</Body1>
              </>
            ) : activePaymentMethod?.type === 'klarna' ? (
              <>
                <img
                  src="/settings/membership/klarna.webp"
                  alt="Klarna"
                  className="h-6 w-auto rounded-md object-contain"
                />
                <Body1 className="text-primary">Pay with Klarna</Body1>
              </>
            ) : activePaymentMethod?.type === 'link' ? (
              <>
                <img
                  src="/settings/membership/link.png"
                  alt="Link"
                  className="h-4 w-auto"
                />
                <Body1 className="leading-none text-primary">
                  Pay with Link
                </Body1>
              </>
            ) : null}
            {isFlexSelected && (
              <div className="flex items-center gap-1 rounded-full border px-1.5 py-1">
                <CircleCheckBig
                  className="size-3 text-secondary"
                  strokeWidth={2.5}
                />
                <Body3 className="leading-none text-secondary">HSA/FSA</Body3>
              </div>
            )}
          </div>
        </div>
      </div>

      {error ? <Body2 className="text-pink-700">{error}</Body2> : null}
    </div>
  );
};
