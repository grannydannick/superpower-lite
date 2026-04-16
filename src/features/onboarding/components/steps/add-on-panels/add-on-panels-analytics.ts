import { useRef } from 'react';

import type {
  AddOnItem,
  AddOnItemId,
  OnboardingAddOnsResponse,
} from '@/features/onboarding/api/onboarding-add-ons';
import { useOnboardingAnalytics } from '@/features/onboarding/hooks/use-onboarding-analytics';
import { useAnalytics } from '@/hooks/use-analytics';
import { Sentry } from '@/lib/sentry';

import { getSelectedItems, type ToggleIntent } from './add-on-panels-selectors';

export type SelectionChangeSource = 'card' | 'detail_sheet' | 'cart';

interface AddOnPanelsAnalyticsContext {
  addOnsData: OnboardingAddOnsResponse;
  selectedServiceIds: Set<AddOnItemId>;
}

function applyIntentToSet(
  selectedServiceIds: Set<AddOnItemId>,
  intent: ToggleIntent,
) {
  const next = new Set(selectedServiceIds);
  for (const id of intent.deselect) next.delete(id);
  for (const id of intent.select) next.add(id);
  return next;
}

function getCartSnapshot(
  addOnsData: OnboardingAddOnsResponse,
  selectedServiceIds: Set<AddOnItemId>,
) {
  const items = getSelectedItems(addOnsData.groups, selectedServiceIds);
  let totalCents = 0;
  for (const item of items) totalCents += item.price;

  return {
    cart_item_count: items.length,
    cart_value: totalCents / 100,
    cart_value_cents: totalCents,
  };
}

export const useAddOnPanelsAnalytics = (
  context: AddOnPanelsAnalyticsContext,
) => {
  const { track } = useAnalytics();
  const { trackOnboardingCreditPurchase } = useOnboardingAnalytics();
  const contextRef = useRef(context);
  contextRef.current = context;

  // Analytics must never break the client. Every track function body is wrapped
  // in a try/catch that logs, reports to Sentry, and swallows — a failure in
  // property building, PostHog, or GTM capture must not propagate up to event
  // handlers or the post-purchase cleanup path.
  const safely = (eventName: string, fn: () => void) => {
    try {
      fn();
    } catch (error) {
      console.error(`Failed to track ${eventName}:`, error);
      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        { contexts: { analytics: { event: eventName } } },
      );
    }
  };

  const trackItemAdded = (
    item: AddOnItem,
    intent: ToggleIntent,
    source: SelectionChangeSource,
  ) => {
    safely('onboarding_addon_panels_item_added', () => {
      const { addOnsData, selectedServiceIds } = contextRef.current;
      const afterIds = applyIntentToSet(selectedServiceIds, intent);
      const priceDollars = item.price / 100;

      const swappedOutIds: AddOnItemId[] = [];
      for (const id of intent.deselect) {
        if (id !== item.id) swappedOutIds.push(id);
      }

      track('onboarding_addon_panels_item_added', {
        source,
        item_id: item.id,
        item_name: item.name,
        item_price: priceDollars,
        value: priceDollars,
        swapped_out_item_ids: swappedOutIds,
        ...getCartSnapshot(addOnsData, afterIds),
      });
    });
  };

  const trackItemRemoved = (
    item: AddOnItem,
    intent: ToggleIntent,
    source: SelectionChangeSource,
  ) => {
    safely('onboarding_addon_panels_item_removed', () => {
      const { addOnsData, selectedServiceIds } = contextRef.current;
      const afterIds = applyIntentToSet(selectedServiceIds, intent);
      const priceDollars = item.price / 100;

      track('onboarding_addon_panels_item_removed', {
        source,
        item_id: item.id,
        item_name: item.name,
        item_price: priceDollars,
        value: priceDollars,
        ...getCartSnapshot(addOnsData, afterIds),
      });
    });
  };

  const trackPurchased = (params: {
    items: AddOnItem[];
    paymentProvider: string;
  }) => {
    // Back-compat event. `trackOnboardingCreditPurchase` wraps its `track()`
    // call in `Promise.resolve(...)` which does not catch synchronous throws,
    // so it is wrapped here via `safely` — otherwise a failure would block
    // post-purchase cleanup for a user who has already been charged.
    safely('onboarding_credits_purchased', () => {
      const credits: Array<{ id: AddOnItemId; price: number }> = [];
      let totalValue = 0;
      for (const item of params.items) {
        credits.push({ id: item.id, price: item.price });
        totalValue += item.price;
      }
      trackOnboardingCreditPurchase({
        credits,
        totalValue,
        paymentProvider: params.paymentProvider,
      });
    });

    safely('onboarding_addon_panels_purchased', () => {
      let totalCents = 0;
      const itemIds: AddOnItemId[] = [];
      const itemsPayload: Array<{ id: string; name: string; price: number }> =
        [];
      for (const item of params.items) {
        totalCents += item.price;
        itemIds.push(item.id);
        itemsPayload.push({
          id: item.id,
          name: item.name,
          price: item.price / 100,
        });
      }

      track('onboarding_addon_panels_purchased', {
        value: totalCents / 100,
        total_price_cents: totalCents,
        item_count: params.items.length,
        item_ids: itemIds,
        items: itemsPayload,
        payment_provider: params.paymentProvider.toLowerCase(),
      });
    });
  };

  const trackPurchaseFailed = (params: {
    items: AddOnItem[];
    paymentProvider: string;
    errorMessage: string | null;
  }) => {
    safely('onboarding_addon_panels_purchase_failed', () => {
      let totalCents = 0;
      const itemIds: AddOnItemId[] = [];
      for (const item of params.items) {
        totalCents += item.price;
        itemIds.push(item.id);
      }

      track('onboarding_addon_panels_purchase_failed', {
        value: totalCents / 100,
        total_price_cents: totalCents,
        item_count: params.items.length,
        item_ids: itemIds,
        payment_provider: params.paymentProvider.toLowerCase(),
        error_message: params.errorMessage,
      });
    });
  };

  return {
    trackItemAdded,
    trackItemRemoved,
    trackPurchased,
    trackPurchaseFailed,
  };
};
