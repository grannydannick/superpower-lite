import { CircleCheckBig, MoreVertical, Plus } from 'lucide-react';

import { DotIcon } from '@/components/icons/dot';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Label } from '@/components/ui/label';
import { Body1, Body3 } from '@/components/ui/typography';
import { useSetDefaultPaymentMethod } from '@/features/settings/api';
import { CreatePaymentMethodDialog } from '@/features/settings/components/billing/create-payment-method-dialog';
import {
  DeletePaymentMethodMenuItem,
  SetDefaultPaymentMethodMenuItem,
} from '@/features/settings/components/billing/payment-method-list';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/format';

export const PaymentMethodsSelect = ({
  disableFlexOptions,
}: {
  disableFlexOptions?: boolean;
}) => {
  const {
    activePaymentMethodId,
    setSelectedPaymentMethodId,
    paymentMethods,
    stopSelectingPaymentMethod,
  } = usePaymentMethodSelection();
  const { mutate: setDefaultPaymentMethod, isPending: isSettingDefault } =
    useSetDefaultPaymentMethod({
      mutationConfig: {
        onSuccess: () => stopSelectingPaymentMethod(),
      },
    });

  const handleSelect = (paymentMethod: (typeof paymentMethods)[number]) => {
    setSelectedPaymentMethodId(paymentMethod.externalPaymentMethodId);
    const isFlexCard = paymentMethod.paymentProvider.toLowerCase() === 'flex';
    // Flex can't be set as default server-side yet (#1457); already-default is a no-op.
    if (isFlexCard || paymentMethod.default) {
      stopSelectingPaymentMethod();
      return;
    }
    setDefaultPaymentMethod({
      paymentMethodId: paymentMethod.externalPaymentMethodId,
      data: { setDefault: true },
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-zinc-500">Active payment methods</Label>
        <Button
          variant="ghost"
          size="icon"
          className="p-0"
          onClick={() => stopSelectingPaymentMethod()}
        >
          <Body3 className="flex items-center text-zinc-500">Go back</Body3>
        </Button>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white">
        {paymentMethods.length > 0 && (
          <div className="p-2">
            {paymentMethods.map((paymentMethod) => {
              const isFlexCard =
                paymentMethod.paymentProvider.toLowerCase() === 'flex';
              const isFlexRestricted = disableFlexOptions && isFlexCard;
              const isDisabled = isFlexRestricted || isSettingDefault;
              const isSelected =
                activePaymentMethodId === paymentMethod.externalPaymentMethodId;
              return (
                <div
                  role="button"
                  tabIndex={isDisabled ? -1 : 0}
                  aria-disabled={isDisabled}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[8px] p-4 text-left',
                    isSettingDefault
                      ? 'animate-pulse cursor-not-allowed bg-zinc-100'
                      : isFlexRestricted
                        ? 'cursor-not-allowed opacity-50'
                        : isSelected
                          ? 'bg-zinc-100 hover:bg-zinc-100'
                          : 'hover:bg-zinc-100',
                  )}
                  key={paymentMethod.externalPaymentMethodId}
                  onClick={() => {
                    if (isDisabled) return;
                    handleSelect(paymentMethod);
                  }}
                  onKeyDown={(e) => {
                    if (isDisabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(paymentMethod);
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {paymentMethod.type === 'card' && paymentMethod.card ? (
                        <Body1 className="text-zinc-600">
                          {capitalize(paymentMethod.card.brand)} ****
                          {paymentMethod.card.last4}
                        </Body1>
                      ) : paymentMethod.type === 'klarna' ? (
                        <>
                          <img
                            src="/settings/membership/klarna.webp"
                            alt="Klarna"
                            className="h-6 w-auto object-contain"
                          />
                        </>
                      ) : paymentMethod.type === 'link' ? (
                        <>
                          <img
                            src="/settings/membership/link.png"
                            alt="Link"
                            className="h-4 w-auto object-contain"
                            style={{ display: 'block' }}
                          />
                        </>
                      ) : null}
                      <div className="flex items-center gap-1.5">
                        {paymentMethod.default && (
                          <>
                            <DotIcon className="leading-none text-zinc-500" />
                            <Body3 className="leading-none text-zinc-500">
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
                    {paymentMethod.type === 'card' && paymentMethod.card && (
                      <Body3 className="text-zinc-400">
                        Expires on {paymentMethod.card.exp_month}/
                        {paymentMethod.card.exp_year}
                      </Body3>
                    )}
                    {isFlexRestricted && (
                      <Body3 className="text-pink-600">
                        Sorry, HSA/FSA cards are currently not supported for
                        this purchase. Please select a different payment method.
                      </Body3>
                    )}
                  </div>
                  {!isFlexCard && !paymentMethod.default && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={isSettingDefault}
                          className="flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="size-4 cursor-pointer text-zinc-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="rounded-2xl p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SetDefaultPaymentMethodMenuItem
                          paymentMethodId={
                            paymentMethod.externalPaymentMethodId
                          }
                          setDefault={!paymentMethod.default}
                        />
                        {paymentMethods.length > 1 && (
                          <DeletePaymentMethodMenuItem {...paymentMethod} />
                        )}
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
          <CreatePaymentMethodDialog>
            <Button
              variant="ghost"
              disabled={isSettingDefault}
              className="group flex cursor-pointer items-center gap-1.5 p-0 text-sm text-zinc-400 hover:text-zinc-700"
            >
              <Plus
                strokeWidth={2.75}
                className="size-4 text-zinc-400 transition-colors group-hover:text-zinc-700"
              />
              Add payment method
            </Button>
          </CreatePaymentMethodDialog>
        </div>
      </div>
    </div>
  );
};
