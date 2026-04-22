import { useCallback } from 'react';

import { useAnalytics } from '@/hooks/use-analytics';

type CreditPurchase = {
  id: string;
  price: number;
  name?: string;
};

type TrackOnboardingCreditPurchaseParams = {
  credits: CreditPurchase[];
  totalValue: number;
  paymentProvider: string;
  flowContext?: string;
};

type TrackOnboardingCreditAddedToCartParams = {
  id: string;
  price: number;
  flowContext?: string;
};

export const useOnboardingAnalytics = () => {
  const { track } = useAnalytics();

  const trackOnboardingCreditPurchase = useCallback(
    ({
      credits,
      totalValue,
      paymentProvider,
      flowContext,
    }: TrackOnboardingCreditPurchaseParams): void => {
      const paymentProviderName = paymentProvider.toLowerCase();

      // Non blocking fire-and-forget
      void Promise.all([
        Promise.resolve(
          track('onboarding_credits_purchased', {
            credits,
            totalValue,
            value: totalValue,
            payment_provider: paymentProviderName,
            flow_context: flowContext,
          }),
        ),
        Promise.resolve(
          track('credits_purchased', {
            credits,
            totalValue,
            value: totalValue / 100,
            total_price_cents: totalValue,
            item_count: credits.length,
            item_ids: credits.map((credit) => credit.id),
            items: credits.map((credit) => ({
              id: credit.id,
              name: credit.name,
              price: credit.price / 100,
            })),
            payment_provider: paymentProviderName,
            flow_context: flowContext,
          }),
        ),
      ]).catch((error) => {
        console.error('Failed to track onboarding credit purchase:', error);
      });
    },
    [track],
  );

  const trackOnboardingCreditAddedToCart = useCallback(
    ({
      id,
      price,
      flowContext,
    }: TrackOnboardingCreditAddedToCartParams): void => {
      // Non blocking fire-and-forget
      void Promise.all([
        Promise.resolve(
          track('onboarding_credits_added_to_cart', {
            credit_id: id,
            credit_price: price,
            value: price,
            flow_context: flowContext,
          }),
        ),
        Promise.resolve(
          track('credits_added_to_cart', {
            credit_id: id,
            credit_price: price,
            value: price / 100,
            flow_context: flowContext,
          }),
        ),
      ]).catch((error) => {
        console.error('Failed to track onboarding credit add to cart:', error);
      });
    },
    [track],
  );

  return {
    trackOnboardingCreditPurchase,
    trackOnboardingCreditAddedToCart,
  };
};
