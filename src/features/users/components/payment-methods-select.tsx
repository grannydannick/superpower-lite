import { MoreVertical, Plus } from 'lucide-react';
import { ReactNode } from 'react';

import { DotIcon } from '@/components/icons/dot';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Label } from '@/components/ui/label';
import { Body1, Body3 } from '@/components/ui/typography';
import { usePaymentMethods } from '@/features/settings/api';
import { CreatePaymentMethodDialog } from '@/features/settings/components/billing/create-payment-method-dialog';
import {
  DeletePaymentMethodMenuItem,
  SetDefaultPaymentMethodMenuItem,
} from '@/features/settings/components/billing/payment-method-list';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/format';

export const PaymentMethodsSelect = ({
  onPaymentMethodAdd,
  closeBtn,
}: {
  onPaymentMethodAdd?: () => void;
  closeBtn?: ReactNode;
}) => {
  const paymentMethodsQuery = usePaymentMethods({});

  const paymentMethods = paymentMethodsQuery.data?.paymentMethods ?? [];

  return (
    <div className="space-y-2">
      {closeBtn ? (
        <div className="flex items-center justify-between">
          <Label className="text-sm text-zinc-500">
            Active payment methods
          </Label>
          {closeBtn}
        </div>
      ) : (
        <Label className="text-sm text-zinc-500">Active payment methods</Label>
      )}
      <div className="rounded-xl border border-zinc-200 bg-white md:bg-transparent">
        {paymentMethods.length > 0 && (
          <div className="p-2">
            {paymentMethods.map((paymentMethod, i) => (
              <div
                className={cn(
                  'flex items-center justify-between rounded-[8px] p-4 hover:bg-zinc-50',
                  paymentMethod?.default ? 'bg-zinc-50' : null,
                )}
                key={i}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Body1 className="text-zinc-600">
                      {capitalize(paymentMethod.card.brand ?? '')} ****
                      {paymentMethod.card.last4}
                    </Body1>
                    {paymentMethod.default ? (
                      <div className="hidden items-center gap-2 md:flex">
                        <DotIcon className="text-zinc-500" />
                        <Body3 className="text-zinc-500">Default method</Body3>
                      </div>
                    ) : null}
                  </div>
                  <Body3 className="text-zinc-400">
                    Expires on {paymentMethod.card.exp_month}/
                    {paymentMethod.card.exp_year}
                  </Body3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {!paymentMethod.default ? (
                      <MoreVertical className="size-4 cursor-pointer text-zinc-400" />
                    ) : null}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-2xl p-2">
                    <SetDefaultPaymentMethodMenuItem
                      paymentMethodId={paymentMethod.stripePaymentMethodId}
                      setDefault={!paymentMethod.default}
                    />
                    <DeletePaymentMethodMenuItem {...paymentMethod} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
        <div
          className={cn(paymentMethods.length > 0 ? 'pb-3' : 'py-3', `px-6`)}
        >
          {onPaymentMethodAdd ? (
            <Button
              variant="ghost"
              className="group flex cursor-pointer items-center gap-1.5 p-0 text-sm text-zinc-400 hover:text-zinc-700"
              onClick={onPaymentMethodAdd}
            >
              <Plus
                strokeWidth={2.75}
                className="size-4 text-zinc-400 transition-colors group-hover:text-zinc-700"
              />
              Add payment method
            </Button>
          ) : (
            <CreatePaymentMethodDialog>
              <Button
                variant="ghost"
                className="group flex cursor-pointer items-center gap-1.5 p-0 text-sm text-zinc-400 hover:text-zinc-700"
              >
                <Plus
                  strokeWidth={2.75}
                  className="size-4 text-zinc-400 transition-colors group-hover:text-zinc-700"
                />
                Add payment method
              </Button>
            </CreatePaymentMethodDialog>
          )}
        </div>
      </div>
    </div>
  );
};
