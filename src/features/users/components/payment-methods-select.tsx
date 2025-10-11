import { CircleCheckBig, MoreVertical, Plus } from 'lucide-react';
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
  selectedPaymentMethodId,
  onPaymentMethodSelect,
}: {
  onPaymentMethodAdd?: () => void;
  closeBtn?: ReactNode;
  selectedPaymentMethodId?: string;
  onPaymentMethodSelect?: (paymentMethodId: string) => void;
}) => {
  const paymentMethodsQuery = usePaymentMethods({});
  const paymentMethods = paymentMethodsQuery.data?.paymentMethods ?? [];

  const handleCardClick = (paymentMethodId: string) => {
    if (!onPaymentMethodSelect) return;
    onPaymentMethodSelect(paymentMethodId);
  };

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
      <div className="rounded-xl border border-zinc-200 bg-white">
        {paymentMethods.length > 0 && (
          <div className="p-2">
            {paymentMethods.map((paymentMethod, i) => {
              const isFlexCard =
                paymentMethod.paymentProvider.toLowerCase() === 'flex';
              const isSelected =
                selectedPaymentMethodId ===
                paymentMethod.externalPaymentMethodId;
              const isClickable = onPaymentMethodSelect;

              return (
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[8px] p-4 text-left',
                    isClickable && 'cursor-pointer',
                    isSelected
                      ? 'bg-zinc-100 hover:bg-zinc-100'
                      : 'hover:bg-zinc-100',
                  )}
                  key={i}
                  onClick={() =>
                    handleCardClick(paymentMethod.externalPaymentMethodId)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(paymentMethod.externalPaymentMethodId);
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Body1 className="text-zinc-600">
                        {capitalize(paymentMethod.card.brand ?? '')} ****
                        {paymentMethod.card.last4}
                      </Body1>
                      <div className="flex items-center gap-1.5">
                        {paymentMethod.default && (
                          <>
                            <DotIcon className="text-zinc-500" />
                            <Body3 className="text-zinc-500">
                              Default method
                            </Body3>
                          </>
                        )}
                        {isFlexCard && (
                          <>
                            <DotIcon className="text-zinc-500" />
                            <div className="flex items-center gap-1 rounded-full border px-1.5 py-1">
                              <CircleCheckBig
                                className="size-3 text-secondary"
                                strokeWidth={2.5}
                              />
                              <Body3 className="leading-none text-secondary">
                                HSA/FSA
                              </Body3>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <Body3 className="text-zinc-400">
                      Expires on {paymentMethod.card.exp_month}/
                      {paymentMethod.card.exp_year}
                    </Body3>
                  </div>
                  {!isFlexCard && !paymentMethod.default && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="size-4 cursor-pointer text-zinc-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-2xl p-2">
                        <SetDefaultPaymentMethodMenuItem
                          paymentMethodId={paymentMethod.stripePaymentMethodId}
                          setDefault={!paymentMethod.default}
                        />
                        <DeletePaymentMethodMenuItem {...paymentMethod} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
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
