import { useRef } from 'react';

import { useAnalytics } from '@/hooks/use-analytics';
import { Sentry } from '@/lib/sentry';

import { getSelectedItems, type ToggleIntent } from './add-on-panels-selectors';
import type {
  AddOnItem,
  AddOnItemId,
  OnboardingAddOnsResponse,
} from './api/add-on-panels';

export type SelectionChangeSource = 'card' | 'detail_sheet' | 'cart';

export interface AddOnPanelsAnalyticsFlowContext {
  flowContext: 'onboarding' | 'schedule_addons' | 'schedule_retest';
}

interface AddOnPanelsAnalyticsContext {
  addOnsData: OnboardingAddOnsResponse;
  selectedServiceIds: Set<AddOnItemId>;
  analyticsContext: AddOnPanelsAnalyticsFlowContext;
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

function getAnalyticsContextProperties(
  analyticsContext: AddOnPanelsAnalyticsFlowContext,
) {
  return {
    flow_context: analyticsContext.flowContext,
  };
}

export const useAddOnPanelsAnalytics = (
  context: AddOnPanelsAnalyticsContext,
) => {
  const { track } = useAnalytics();
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
    const { addOnsData, selectedServiceIds, analyticsContext } =
      contextRef.current;
    const eventName =
      analyticsContext.flowContext === 'onboarding'
        ? 'onboarding_addon_panels_item_added'
        : 'addon_panels_item_added';
    const afterIds = applyIntentToSet(selectedServiceIds, intent);
    const priceDollars = item.price / 100;

    const swappedOutIds: AddOnItemId[] = [];
    for (const id of intent.deselect) {
      if (id !== item.id) swappedOutIds.push(id);
    }

    safely(eventName, () => {
      track(eventName, {
        source,
        item_id: item.id,
        item_name: item.name,
        item_price: priceDollars,
        value: priceDollars,
        swapped_out_item_ids: swappedOutIds,
        ...getAnalyticsContextProperties(analyticsContext),
        ...getCartSnapshot(addOnsData, afterIds),
      });
    });
  };

  const trackItemRemoved = (
    item: AddOnItem,
    intent: ToggleIntent,
    source: SelectionChangeSource,
  ) => {
    const { addOnsData, selectedServiceIds, analyticsContext } =
      contextRef.current;
    const eventName =
      analyticsContext.flowContext === 'onboarding'
        ? 'onboarding_addon_panels_item_removed'
        : 'addon_panels_item_removed';
    const afterIds = applyIntentToSet(selectedServiceIds, intent);
    const priceDollars = item.price / 100;

    safely(eventName, () => {
      track(eventName, {
        source,
        item_id: item.id,
        item_name: item.name,
        item_price: priceDollars,
        value: priceDollars,
        ...getAnalyticsContextProperties(analyticsContext),
        ...getCartSnapshot(addOnsData, afterIds),
      });
    });
  };

  const trackPurchased = (params: {
    items: AddOnItem[];
    paymentProvider: string;
  }) => {
    safely('add_on_panels_track_purchased', () => {
      const { analyticsContext } = contextRef.current;
      const isOnboarding = analyticsContext.flowContext === 'onboarding';
      const addOnPanelsEventName = isOnboarding
        ? 'onboarding_addon_panels_purchased'
        : 'addon_panels_purchased';
      const paymentProvider = params.paymentProvider.toLowerCase();
      let totalCents = 0;
      const itemIds: AddOnItemId[] = [];
      const credits: Array<{ id: AddOnItemId; price: number; name: string }> =
        [];
      const itemsPayload: Array<{ id: string; name: string; price: number }> =
        [];
      for (const item of params.items) {
        totalCents += item.price;
        itemIds.push(item.id);
        credits.push({ id: item.id, price: item.price, name: item.name });
        itemsPayload.push({
          id: item.id,
          name: item.name,
          price: item.price / 100,
        });
      }

      if (isOnboarding) {
        safely('onboarding_credits_purchased', () => {
          track('onboarding_credits_purchased', {
            credits,
            totalValue: totalCents,
            value: totalCents,
            payment_provider: paymentProvider,
            flow_context: analyticsContext.flowContext,
          });
        });
      }

      safely('credits_purchased', () => {
        track('credits_purchased', {
          value: totalCents / 100,
          total_price_cents: totalCents,
          item_count: params.items.length,
          item_ids: itemIds,
          items: itemsPayload,
          payment_provider: paymentProvider,
          ...getAnalyticsContextProperties(analyticsContext),
        });
      });

      safely(addOnPanelsEventName, () => {
        track(addOnPanelsEventName, {
          value: totalCents / 100,
          total_price_cents: totalCents,
          item_count: params.items.length,
          item_ids: itemIds,
          items: itemsPayload,
          payment_provider: paymentProvider,
          ...getAnalyticsContextProperties(analyticsContext),
        });
      });
    });
  };

  const trackPurchaseFailed = (params: {
    items: AddOnItem[];
    paymentProvider: string;
    errorMessage: string | null;
  }) => {
    safely('add_on_panels_track_purchase_failed', () => {
      const { analyticsContext } = contextRef.current;
      const addOnPanelsEventName =
        analyticsContext.flowContext === 'onboarding'
          ? 'onboarding_addon_panels_purchase_failed'
          : 'addon_panels_purchase_failed';
      const paymentProvider = params.paymentProvider.toLowerCase();
      let totalCents = 0;
      const itemIds: AddOnItemId[] = [];
      for (const item of params.items) {
        totalCents += item.price;
        itemIds.push(item.id);
      }

      safely(addOnPanelsEventName, () => {
        track(addOnPanelsEventName, {
          value: totalCents / 100,
          total_price_cents: totalCents,
          item_count: params.items.length,
          item_ids: itemIds,
          payment_provider: paymentProvider,
          error_message: params.errorMessage,
          ...getAnalyticsContextProperties(analyticsContext),
        });
      });

      safely('credits_purchase_failed', () => {
        track('credits_purchase_failed', {
          value: totalCents / 100,
          total_price_cents: totalCents,
          item_count: params.items.length,
          item_ids: itemIds,
          payment_provider: paymentProvider,
          error_message: params.errorMessage,
          ...getAnalyticsContextProperties(analyticsContext),
        });
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
