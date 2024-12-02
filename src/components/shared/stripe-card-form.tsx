import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from '@stripe/react-stripe-js';
import { StripeElementStyle, StripeError } from '@stripe/stripe-js';
import { FormEvent, FormHTMLAttributes, forwardRef } from 'react';

import { Label } from '@/components/ui/label';
import { Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

const STRIPE_INPUT_STYLE: { style: StripeElementStyle } = {
  style: {
    base: {
      color: '#52525B',
      fontSize: '16px',
      '::placeholder': {
        color: '#A1A1AA',
      },
      '::selection': { color: 'white', backgroundColor: '#FDBA74' },
    },
    invalid: {
      color: '#B90090',
    },
  },
};

enum ERROR_TYPES {
  CVC = 'incomplete_cvc',
  EXPIRY = 'incomplete_expiry',
  NUMBER = 'incomplete_number',
}

interface StripeCardFormProps extends FormHTMLAttributes<HTMLFormElement> {
  error?: StripeError;
  setError?: (error: StripeError | undefined) => void;
  processing: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const StripeCardForm = forwardRef<HTMLFormElement, StripeCardFormProps>(
  ({ id, processing, error, onSubmit, setError, ...rest }, ref) => {
    return (
      <form
        onSubmit={onSubmit}
        className="grid gap-8"
        id={id}
        {...rest}
        ref={ref}
      >
        <div className="space-y-2">
          <Label
            htmlFor="cardNumber"
            className={cn(
              'text-sm text-zinc-500',
              error?.code === ERROR_TYPES.NUMBER ? 'text-pink-700' : null,
            )}
          >
            Card number
          </Label>
          <CardNumberElement
            id="cardNumber"
            options={{
              disableLink: true,
              disabled: processing,
              ...STRIPE_INPUT_STYLE,
            }}
            onFocus={() => setError && setError(undefined)}
            className={cn(
              'rounded-xl border border-input bg-white px-6 py-4 text-base text-foreground',
              processing ? 'opacity-50' : null,
              error?.code === ERROR_TYPES.NUMBER
                ? 'border-pink-700 bg-pink-50 text-pink-700 placeholder:text-pink-700'
                : null,
            )}
          />
          {error?.code === ERROR_TYPES.NUMBER ? (
            <Body3 className="text-pink-700">{error?.message}</Body3>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="cardExpiration"
              className={cn(
                'text-sm text-zinc-500',
                error?.code === ERROR_TYPES.EXPIRY ? 'text-pink-700' : null,
              )}
            >
              Expiration date
            </Label>
            <CardExpiryElement
              options={{
                disabled: processing,
                ...STRIPE_INPUT_STYLE,
              }}
              onFocus={() => setError && setError(undefined)}
              id="cardExpiration"
              className={cn(
                'rounded-xl border border-input bg-white px-6 py-4 text-base text-foreground',
                processing ? 'opacity-50' : null,
                error?.code === ERROR_TYPES.EXPIRY
                  ? 'border-pink-700 bg-pink-50 text-pink-700 placeholder:text-pink-700'
                  : null,
              )}
            />
            {error?.code === ERROR_TYPES.EXPIRY ? (
              <Body3 className="text-pink-700">{error?.message}</Body3>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="cardCvc"
              className={cn(
                'text-sm text-zinc-500',
                error?.code === ERROR_TYPES.CVC ? 'text-pink-700' : null,
              )}
            >
              CVC
            </Label>
            <CardCvcElement
              options={{
                disabled: processing,
                ...STRIPE_INPUT_STYLE,
              }}
              onFocus={() => setError && setError(undefined)}
              id="cardCvc"
              className={cn(
                'rounded-xl border border-input bg-white px-6 py-4 text-base text-foreground',
                processing ? 'opacity-50' : null,
                error?.code === ERROR_TYPES.CVC
                  ? 'border-pink-700 bg-pink-50 text-pink-700 placeholder:text-pink-700'
                  : null,
              )}
            />
            {error?.code === ERROR_TYPES.CVC ? (
              <Body3 className="text-pink-700">{error?.message}</Body3>
            ) : null}
          </div>
        </div>
      </form>
    );
  },
);

StripeCardForm.displayName = StripeCardForm.name;
