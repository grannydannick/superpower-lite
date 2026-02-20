import { ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import {
  useProductCheckoutUrl,
  useRevealStatus,
  useCompleteReveal,
} from '@/features/protocol/api';
import { CheckoutLayout } from '@/features/protocol/components/layouts/checkout-layout';
import { REVEAL_STEPS } from '@/features/protocol/components/reveal/reveal-stepper';
import { useProtocolCheckout } from '@/features/protocol/hooks/use-protocol-checkout';
import { useShippingFee } from '@/features/protocol/hooks/use-shipping-fee';
import { getActivityPricing } from '@/features/protocol/utils/get-activity-pricing';
import { useAnalytics } from '@/hooks/use-analytics';
import { formatMoney } from '@/utils/format-money';

type ProductCheckoutStepProps = {
  carePlanId: string;
  next: () => void;
  previous: () => void;
};

export const ProductCheckoutStep = ({
  carePlanId,
  next,
  previous,
}: ProductCheckoutStepProps) => {
  const navigate = useNavigate();
  const completeRevealMutation = useCompleteReveal();
  const { items } = useProtocolCheckout();
  const [started, setStarted] = useState(false);
  const { track } = useAnalytics();
  const revealStatusQuery = useRevealStatus(carePlanId, {
    enabled: started,
    refetchInterval: started ? 5000 : undefined,
  });
  const checkoutQuery = useProductCheckoutUrl(carePlanId, {
    enabled: started,
  });

  const productItems = useMemo(() => {
    return items.filter((it) => it.data?.type === 'product');
  }, [items]);

  const totalCents = useMemo(() => {
    return productItems.reduce((sum, it) => {
      const pricing = getActivityPricing(it.data, null);
      return sum + pricing.finalCents;
    }, 0);
  }, [productItems]);

  const { shippingCents } = useShippingFee(totalCents);

  const checkoutUrl = checkoutQuery.data?.checkoutUrl ?? null;
  const shopifyOrderId = checkoutQuery.data?.shopifyOrderId ?? null;
  const shouldSkipCheckoutStep = checkoutQuery.isSuccess && !shopifyOrderId;

  const hasCompleted =
    revealStatusQuery.data?.progress.productCheckoutCompleted ?? false;
  const hasOpenedCheckout = useRef(false);

  useEffect(() => {
    if (hasCompleted || shouldSkipCheckoutStep) {
      next();
    }
  }, [hasCompleted, next, shouldSkipCheckoutStep]);

  useEffect(() => {
    if (started && checkoutUrl && !hasOpenedCheckout.current) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      hasOpenedCheckout.current = true;
    }
  }, [checkoutUrl, started]);

  const handleRefresh = () => {
    revealStatusQuery.refetch();
  };

  const handleReopenCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    checkoutQuery.refetch();
  };

  const handleCompleteWithoutAction = async () => {
    track('protocol_reveal_quit', {
      reason: 'product_checkout_step_quit',
      careplanId: carePlanId,
    });
    try {
      await completeRevealMutation.mutateAsync(carePlanId);
      navigate('/protocol');
    } catch (e) {
      console.error('Error completing reveal', e);
      // fall back to navigate
      navigate('/protocol');
    }
  };

  // pre-checkout confirmation view
  if (!started) {
    return (
      <CheckoutLayout step={REVEAL_STEPS.PRODUCT_CHECKOUT}>
        <div className="mb-8 flex-1 space-y-4 rounded-3xl border-zinc-100 lg:mb-0 lg:border lg:bg-white lg:p-8">
          <H4 className="hidden lg:block">Checkout</H4>
          <div className="space-y-2">
            {productItems.length === 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <Body2 className="text-secondary">No items selected.</Body2>
              </div>
            )}
            {productItems.map((it, idx) => {
              const activity = it.data;
              const { finalCents, hasDiscount, originalCents } =
                getActivityPricing(activity, null);
              const title =
                activity.type === 'product' ? activity.product.name : 'Item';
              const image =
                activity.type === 'product'
                  ? activity.product.image
                  : undefined;
              return (
                <div
                  key={it.id ?? idx}
                  className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  {image && (
                    <img
                      src={image}
                      alt={title}
                      className="size-12 rounded-md object-cover"
                    />
                  )}
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <Body2 className="font-medium">{title}</Body2>
                    <div className="flex items-center gap-2">
                      {hasDiscount && (
                        <Body2 className="text-zinc-500 line-through">
                          {formatMoney(originalCents)}
                        </Body2>
                      )}
                      <Body2 className="font-semibold">
                        {formatMoney(finalCents)}
                      </Body2>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-2 rounded-xl p-4 pb-0">
            <div className="flex items-center justify-between">
              <Body1 className="text-secondary">Subtotal</Body1>
              <Body1>{formatMoney(totalCents)}</Body1>
            </div>
            <div className="flex items-center justify-between">
              <Body1 className="text-secondary">Shipping</Body1>
              <Body1>
                {shippingCents === 0 ? 'Free' : formatMoney(shippingCents)}
              </Body1>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
              <Body1 className="text-secondary">Total</Body1>
              <Body1>{formatMoney(totalCents + shippingCents)}</Body1>
            </div>
          </div>
        </div>
        <div className="w-full space-y-8">
          <div className="hidden space-y-3 lg:block">
            <H3>Purchase Supplements</H3>
            <Body1 className="text-secondary">
              You will be redirected to our Supplement checkout page for
              purchase.
            </Body1>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => setStarted(true)}
              disabled={productItems.length === 0}
            >
              Purchase
            </Button>
            <Button
              className="bg-white"
              variant="outline"
              onClick={handleCompleteWithoutAction}
            >
              I don’t want to act on my results yet
            </Button>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  if (checkoutQuery.isError) {
    return (
      <CheckoutLayout step={REVEAL_STEPS.PRODUCT_CHECKOUT}>
        <div className="col-span-2 mx-auto w-full px-6 text-center lg:max-w-md">
          <H3>We couldn’t open your checkout</H3>
          <Body1 className="mt-2 text-secondary">
            Please refresh or go back to rebuild your order.
          </Body1>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={() => checkoutQuery.refetch()}>Try again</Button>
            <Button variant="outline" onClick={previous}>
              Back
            </Button>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  const isLoading =
    (revealStatusQuery.isLoading && !revealStatusQuery.data) ||
    checkoutQuery.isLoading;

  return (
    <CheckoutLayout step={REVEAL_STEPS.PRODUCT_CHECKOUT}>
      <div className="col-span-2 mx-auto flex w-full flex-col items-center gap-6 space-y-8 px-6 text-center lg:max-w-md">
        <div>
          {isLoading ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <Spinner variant="primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-zinc-100">
                <ShoppingCart className="size-7 text-zinc-500" />
              </div>
              <H4>You will be redirected to Shopify for completion.</H4>
              <Body2 className="text-balance text-secondary">
                This page will automatically refresh upon completion. If it
                doesn’t refresh, please click below.
              </Body2>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button
            onClick={handleRefresh}
            disabled={revealStatusQuery.isRefetching}
          >
            {revealStatusQuery.isRefetching ? 'Refreshing...' : 'Refresh page'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReopenCheckout}
            disabled={!checkoutUrl}
          >
            Reopen checkout
          </Button>
        </div>

        <Button variant="ghost" onClick={previous}>
          Back
        </Button>
      </div>
    </CheckoutLayout>
  );
};
