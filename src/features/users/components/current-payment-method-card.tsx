import { CircleCheckBig, Pencil, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Body1, Body2, Body3 } from '@/components/ui/typography';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { PaymentMethodsSelect } from '@/features/users/components/payment-methods-select';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/format';

export const CurrentPaymentMethodCard = ({
  error,
  className,
  selectedPaymentMethodId,
  onPaymentMethodSelect,
}: {
  error?: string;
  className?: string;
  selectedPaymentMethodId?: string;
  onPaymentMethodSelect?: (paymentMethodId: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const { defaultPaymentMethod, activePaymentMethod, isFlexSelected } =
    usePaymentMethodSelection(selectedPaymentMethodId);

  if (isEditing) {
    return (
      <PaymentMethodsSelect
        selectedPaymentMethodId={
          selectedPaymentMethodId ||
          defaultPaymentMethod?.externalPaymentMethodId
        }
        onPaymentMethodSelect={(id) => {
          onPaymentMethodSelect?.(id);
          setIsEditing(false);
        }}
        closeBtn={
          <X
            className="size-4 cursor-pointer text-zinc-500"
            onClick={() => setIsEditing(false)}
          />
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'w-full space-y-3 rounded-2xl border px-8 py-6 bg-white',
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
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-4 cursor-pointer text-zinc-500" />
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Body1>{capitalize(activePaymentMethod?.card.brand ?? '')}</Body1>
            <Body1>****{activePaymentMethod?.card.last4}</Body1>
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
