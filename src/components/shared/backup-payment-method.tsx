import { StripeError } from '@stripe/stripe-js';

import { StripeCardElement } from '@/components/shared/stripe-card-element';
import { Body2, H3 } from '@/components/ui/typography';
// eslint-disable-next-line import/no-restricted-paths
import { usePaymentMethods } from '@/features/settings/api/get-payment-methods';
// eslint-disable-next-line import/no-restricted-paths
import * as Payment from '@/features/users/components/payment';

interface BackupPaymentMethodProps {
  isLoading: boolean;
  stripeError: StripeError | undefined;
  setStripeError: (error: StripeError | undefined) => void;
}

/**
 * Custom hook to determine if a backup payment method is needed
 * Returns true if user only has HSA/FSA cards (no regular credit cards)
 */
export const useNeedsBackupPaymentMethod = () => {
  const { data: paymentMethodsData } = usePaymentMethods();
  const paymentMethods = paymentMethodsData?.paymentMethods ?? [];

  const needsBackup =
    paymentMethods.length > 0 &&
    !paymentMethods.some((pm) => pm.paymentProvider?.toLowerCase() !== 'flex');

  return { needsBackup, paymentMethods };
};

export const BackupPaymentMethod = ({
  isLoading,
  stripeError,
  setStripeError,
}: BackupPaymentMethodProps) => {
  const { needsBackup } = useNeedsBackupPaymentMethod();

  if (!needsBackup) {
    return null;
  }

  return (
    <div className="my-8 space-y-4">
      <div className="space-y-2">
        <H3>Add a Backup Payment Method</H3>
        <Body2 className="text-secondary">
          Because you paid for your membership with an HSA/FSA card, we need to
          collect a backup credit card.
        </Body2>
      </div>
      <Payment.PaymentGroup>
        <Payment.PaymentDetails />
        <StripeCardElement
          processing={isLoading}
          error={stripeError}
          setError={setStripeError}
        />
      </Payment.PaymentGroup>
    </div>
  );
};
