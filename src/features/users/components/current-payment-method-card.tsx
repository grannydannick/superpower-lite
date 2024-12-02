import { Pencil, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Body1, Body2 } from '@/components/ui/typography';
import { usePaymentMethods } from '@/features/settings/api';
import { PaymentMethodsSelect } from '@/features/users/components/payment-methods-select';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/format';

export const CurrentPaymentMethodCard = ({ error }: { error?: string }) => {
  const [isEditing, setIsEditing] = useState(false);

  const paymentMethodsQuery = usePaymentMethods();

  const defaultPaymentMethod = paymentMethodsQuery.data?.paymentMethods.find(
    (pm) => pm.default,
  );

  if (isEditing) {
    return (
      <PaymentMethodsSelect
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
          'w-full space-y-3 rounded-2xl border px-8 py-6',
          error ? 'border-pink-700 bg-pink-50' : 'border-zinc-200',
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
          <>
            <Body1>{capitalize(defaultPaymentMethod?.card.brand ?? '')}</Body1>
            <Body1>****{defaultPaymentMethod?.card.last4}</Body1>
          </>
        </div>
      </div>

      {error ? <Body2 className="text-pink-700">{error}</Body2> : null}
    </div>
  );
};
