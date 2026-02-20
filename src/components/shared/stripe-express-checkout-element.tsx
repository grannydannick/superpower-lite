import { ExpressCheckoutElement } from '@stripe/react-stripe-js';
import {
  StripeExpressCheckoutElementClickEvent,
  StripeExpressCheckoutElementConfirmEvent,
  StripeExpressCheckoutElementOptions,
} from '@stripe/stripe-js';
import { useState } from 'react';

export const StripeExpressCheckoutElement = ({
  onConfirm,
  membershipAmountInCents,
  processing,
  onClick,
  onAvailabilityChange,
}: {
  onConfirm: (
    event: StripeExpressCheckoutElementConfirmEvent,
  ) => void | Promise<void>;
  onClick?: (event: StripeExpressCheckoutElementClickEvent) => any;
  membershipAmountInCents?: number;
  processing: boolean;
  onAvailabilityChange?: (available: boolean) => void;
}): JSX.Element => {
  const [isReady, setIsReady] = useState(false);

  const options: StripeExpressCheckoutElementOptions = {
    paymentMethods: {
      // We'll let Stripe dashboard dictate Apple/Google Pay availability, but hard-code
      // these to never display while we don't support them
      // This is to prevent someone from adjusting the payment methods in the Stripe dashboard
      // and surfacing one that we don't support to users
      link: 'never',
      amazonPay: 'never',
      paypal: 'never',
    },
    buttonType: {
      applePay: 'plain',
      googlePay: 'plain',
    },
    buttonHeight: 55, // the maximum button height Stripe allows (Figma: 56px)
    buttonTheme: {
      googlePay: 'white',
      applePay: 'black',
    },
    layout: {
      maxColumns: 1,
      overflow: 'never',
    },
    paymentMethodOrder: ['apple_pay', 'google_pay'],
    ...(membershipAmountInCents && membershipAmountInCents > 0
      ? {
          applePay: {
            recurringPaymentRequest: {
              paymentDescription: 'Superpower Membership',
              regularBilling: {
                amount: membershipAmountInCents,
                label: 'Superpower Membership',
                recurringPaymentIntervalUnit: 'year',
                recurringPaymentIntervalCount: 1,
              },
              billingAgreement:
                'Annual membership renews automatically unless cancelled in accordance with the Membership Agreement.',
              managementURL: `${window.location.origin}/settings/billing`,
            },
          },
        }
      : {}),
  } as StripeExpressCheckoutElementOptions;

  return (
    <div
      style={{ display: isReady ? 'block' : 'none' }}
      className="flex flex-col justify-center space-y-4"
    >
      <div
        className={processing ? 'pointer-events-none opacity-60' : ''}
        aria-disabled={processing}
      >
        <ExpressCheckoutElement
          onConfirm={onConfirm}
          className={processing ? 'animate-pulse opacity-50' : undefined}
          onReady={({ availablePaymentMethods }) => {
            // Only show this section if the user has a digital wallet
            // available through either Apple Pay or Google Pay
            const available = Boolean(
              availablePaymentMethods?.applePay ||
              availablePaymentMethods?.googlePay,
            );
            onAvailabilityChange?.(available);
            setIsReady(available);
          }}
          onClick={onClick}
          options={options}
        />
      </div>
    </div>
  );
};
