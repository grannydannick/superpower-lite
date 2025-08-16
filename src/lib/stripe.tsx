import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { ReactNode } from 'react';

import { env } from '@/config/env';

// load outside to prevent rerenders
const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

/** Children of this component have access to useStripe */
export function StripeProvider(props: {
  children: ReactNode | ReactNode[];
}): JSX.Element {
  const { children } = props;

  return (
    <Elements
      stripe={stripePromise}
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
