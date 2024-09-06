import { MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { RadioGroup } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { useDeletePaymentMethod } from '@/features/settings/api/delete-payment-method';
import { usePaymentMethods } from '@/features/settings/api/get-payment-methods';
import { useSetDefaultPaymentMethod } from '@/features/settings/api/set-default-payment-method';
import { cn } from '@/lib/utils';
import { PaymentMethod } from '@/types/api';
import { capitalize } from '@/utils/format';

export function PaymentMethodList(): JSX.Element {
  const paymentMethodsQuery = usePaymentMethods({});

  if (paymentMethodsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!paymentMethodsQuery.data) return <></>;

  const { paymentMethods } = paymentMethodsQuery.data;

  if (paymentMethods.length === 0)
    return (
      <div className="text-gray-400">
        There are no payment methods. Please add one.
      </div>
    );

  return (
    <div>
      <RadioGroup
        defaultValue="option-one"
        className="grid-cols-1 lg:grid-cols-2"
      >
        {paymentMethods.map((paymentMethod) => (
          <PaymentMethodCard
            paymentMethod={paymentMethod}
            key={paymentMethod.stripePaymentMethodId}
            defaultMethod={paymentMethod.default}
          />
        ))}
      </RadioGroup>
    </div>
  );
}

export function PaymentMethodCard({
  paymentMethod,
  defaultMethod,
}: {
  paymentMethod: PaymentMethod;
  defaultMethod: boolean;
}): JSX.Element {
  return (
    <div
      className={cn(
        'flex border-2 border-solid rounded-2xl px-6 py-6 md:py-6 md:px-8',
        defaultMethod ? 'border-zinc-900' : 'border-zinc-200',
      )}
    >
      <div className="flex w-full flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-2xl text-primary">
            {capitalize(paymentMethod.card?.brand ?? '')} ****
            {paymentMethod.card?.last4}
          </h4>
          {!defaultMethod && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="size-4 text-zinc-400 data-[state=open]:bg-muted" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <SetDefaultMenuItem
                  paymentMethodId={paymentMethod.stripePaymentMethodId}
                  setDefault={!defaultMethod}
                />
                <DropdownMenuSeparator />
                <DeleteMenuItem {...paymentMethod} />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div>
          <p className="leading-normal text-zinc-500">
            Expires on {paymentMethod.card.exp_month}/
            {paymentMethod.card.exp_year}
          </p>
          <p className="leading-normal text-zinc-500">
            Zip code - {paymentMethod?.billing_details?.postal_code}
          </p>
        </div>
      </div>
    </div>
  );
}

function SetDefaultMenuItem({
  paymentMethodId,
  setDefault,
}: {
  paymentMethodId: string;
  setDefault: boolean;
}): JSX.Element {
  const { mutate } = useSetDefaultPaymentMethod();

  const onClick = async (): Promise<void> => {
    mutate({ paymentMethodId, data: { setDefault } });
  };

  return (
    <DropdownMenuItem disabled={!setDefault} onClick={onClick}>
      Set default
    </DropdownMenuItem>
  );
}

function DeleteMenuItem({ stripePaymentMethodId }: PaymentMethod): JSX.Element {
  const { mutate } = useDeletePaymentMethod();

  const onClick = async (): Promise<void> => {
    mutate({ paymentMethodId: stripePaymentMethodId });
  };

  return (
    <DropdownMenuItem onClick={onClick} className="text-red-500">
      Delete
    </DropdownMenuItem>
  );
}
