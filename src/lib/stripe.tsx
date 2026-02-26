import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { ReactNode } from 'react';

import { env } from '@/config/env';

let stripePromise: ReturnType<typeof loadStripe> | null = null;

/** Lazily initialises and returns the shared Stripe instance promise. */
export function getStripe() {
  if (stripePromise === null) {
    stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

/** Children of this component have access to useStripe */
export function StripeProvider(props: { children: ReactNode | ReactNode[] }) {
  const { children } = props;
  const [stripe] = React.useState(() => {
    if (stripePromise) return stripePromise;

    stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);
    return stripePromise;
  });

  return (
    <Elements
      stripe={stripe}
      options={{
        mode: 'setup',
        currency: 'usd',
        appearance: {
          variables: {
            borderRadius: '12px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
