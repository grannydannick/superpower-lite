import { ExpressCheckoutElement } from '@stripe/react-stripe-js';
import {
  StripeExpressCheckoutElementConfirmEvent,
  StripeExpressCheckoutElementOptions,
} from '@stripe/stripe-js';
import { useState } from 'react';

import { Body1 } from '@/components/ui/typography';

export const DigitalWalletSection = ({
  onConfirm,
  membershipAmountInCents,
  processing,
}: {
  onConfirm: (
    event: StripeExpressCheckoutElementConfirmEvent,
  ) => void | Promise<void>;
  membershipAmountInCents?: number;
  processing: boolean;
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
          onReady={({ availablePaymentMethods }) => {
            // Only show this section if the user has a digital wallet
            // available through either Apple Pay or Google Pay
            if (
              availablePaymentMethods?.applePay ||
              availablePaymentMethods?.googlePay
            ) {
              setIsReady(true);
            }
          }}
          options={options}
        />
      </div>
      <div className="flex items-center">
        <div className="h-px flex-1 bg-zinc-200" />
        <Body1 className="mx-4 text-center text-base text-zinc-500">
          or pay by card
        </Body1>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>
    </div>
  );
};
