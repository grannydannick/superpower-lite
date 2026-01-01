import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { useAnalytics } from '@/hooks/use-analytics';

type CreditPurchase = {
  id: string;
  price: number;
};

type TrackOnboardingCreditPurchaseParams = {
  credits: CreditPurchase[];
  totalValue: number;
};

export const useOnboardingAnalytics = () => {
  const { track } = useAnalytics();
  const { activePaymentMethod } = usePaymentMethodSelection();
  const trackOnboardingCreditPurchase = ({
    credits,
    totalValue,
  }: TrackOnboardingCreditPurchaseParams): void => {
    // Non blocking fire-and-forget
    void Promise.resolve(
      track('onboarding_credits_purchased', {
        credits,
        totalValue,
        value: totalValue,
        payment_provider:
          activePaymentMethod?.paymentProvider?.toLowerCase() ?? 'unknown',
      }),
    ).catch((error) => {
      console.error('Failed to track onboarding credit purchase:', error);
    });
  };

  return {
    trackOnboardingCreditPurchase,
  };
};
