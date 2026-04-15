import { useCallback, useMemo, useState } from 'react';

import { toast } from '@/components/ui/sonner';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';

import { useShippingFee } from './use-shipping-fee';
import type { SupplementDisplayItem } from './use-supplement-groups';

export const MAX_SUPPLEMENT_QUANTITY = 10;

/**
 * Manages supplement cart state: quantities, totals, and Shopify checkout.
 */
export function useSupplementCart(allItems: SupplementDisplayItem[]) {
  const { track } = useAnalytics();
  const [quantities, setQuantities] = useState<Map<string, number> | null>(
    null,
  );
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const allIds = useMemo(
    () => new Set(allItems.map((s) => s.actionId)),
    [allItems],
  );

  const defaultQuantities = useMemo(() => {
    const map = new Map<string, number>();
    for (const id of allIds) {
      map.set(id, 1);
    }
    return map;
  }, [allIds]);

  const currentQuantities = useMemo(() => {
    if (quantities === null) return defaultQuantities;
    const merged = new Map(defaultQuantities);
    for (const [id, qty] of quantities) {
      merged.set(id, qty);
    }
    return merged;
  }, [quantities, defaultQuantities]);

  const getQuantity = useCallback(
    (id: string) => currentQuantities.get(id) ?? 0,
    [currentQuantities],
  );

  const increment = useCallback(
    (id: string) => {
      track('protocol_reveal_supplement_added_to_cart', { action_id: id });
      setQuantities((prev) => {
        const current = new Map(prev ?? defaultQuantities);
        const qty = current.get(id) ?? 0;
        if (qty >= MAX_SUPPLEMENT_QUANTITY) return current;
        current.set(id, qty + 1);
        return current;
      });
    },
    [defaultQuantities, track],
  );

  const decrement = useCallback(
    (id: string) => {
      track('protocol_reveal_supplement_removed_from_cart', { action_id: id });
      setQuantities((prev) => {
        const current = new Map(prev ?? defaultQuantities);
        const qty = current.get(id) ?? 0;
        if (qty > 0) {
          current.set(id, qty - 1);
        }
        return current;
      });
    },
    [defaultQuantities, track],
  );

  const { totalOriginal, totalDiscounted, selectedCount } = useMemo(() => {
    let original = 0;
    let discounted = 0;
    let count = 0;

    for (const item of allItems) {
      const qty = getQuantity(item.actionId);
      if (qty > 0) {
        original += item.product.price * qty;
        discounted +=
          item.product.price * (1 - item.product.discount / 100) * qty;
        count += qty;
      }
    }

    return {
      totalOriginal: Math.round(original * 100),
      totalDiscounted: Math.round(discounted * 100),
      selectedCount: count,
    };
  }, [allItems, getQuantity]);

  const shipping = useShippingFee(totalDiscounted);

  const checkout = useCallback(
    async (callbacks: {
      saveShopifyOrder: (orderId: string, checkoutUrl: string) => Promise<void>;
      onComplete: () => void;
    }) => {
      const selected = allItems.filter((s) => getQuantity(s.actionId) > 0);
      if (selected.length === 0) return;

      const checkoutWindow = window.open('', '_blank');
      if (!checkoutWindow) {
        toast.error(
          'Unable to open checkout. Please allow popups and try again.',
        );
        return;
      }
      checkoutWindow.opener = null;
      checkoutWindow.document.title = 'Opening checkout...';

      const productNames: string[] = [];
      const productIds: string[] = [];
      for (const s of selected) {
        productNames.push(s.product.name);
        productIds.push(s.product.id);
      }

      track('protocol_reveal_supplement_checkout_started', {
        selected_count: selected.length,
        product_ids: productIds,
        product_names: productNames,
        total_discounted_cents: totalDiscounted,
        total_original_cents: totalOriginal,
        total_with_shipping_cents: shipping.totalWithShipping,
      });

      setIsCheckingOut(true);

      try {
        // One entry per quantity unit (backend doesn't accept quantity field yet)
        const products: {
          id: string;
          name: string;
          price: number;
          url: string;
          discount: number;
          type: string;
          inventoryQuantity: number;
        }[] = [];

        for (const item of selected) {
          const qty = getQuantity(item.actionId);
          for (let i = 0; i < qty; i++) {
            products.push({
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              url: item.product.url,
              discount: item.product.discount,
              type: 'Supplements',
              inventoryQuantity: item.product.inventoryQuantity ?? 100,
            });
          }
        }

        const response = (await api.post('/shop/checkout', {
          products,
        })) as { checkoutUrl: string; orderId: string };

        const checkoutUrl = response.checkoutUrl;
        if (!checkoutUrl) {
          checkoutWindow.close();
          toast.error('Unable to open checkout. Please try again.');
          setIsCheckingOut(false);
          return;
        }

        checkoutWindow.location.href = checkoutUrl;
        callbacks
          .saveShopifyOrder(response.orderId, checkoutUrl)
          .catch(() => {});

        setIsCheckingOut(false);
        callbacks.onComplete();
      } catch (error) {
        console.error('Failed to create checkout:', error);
        checkoutWindow.close();
        toast.error('Unable to create checkout. Please try again.');
        setIsCheckingOut(false);
      }
    },
    [
      allItems,
      getQuantity,
      track,
      totalDiscounted,
      totalOriginal,
      shipping.totalWithShipping,
    ],
  );

  return {
    getQuantity,
    increment,
    decrement,
    totalOriginal,
    totalDiscounted,
    selectedCount,
    shipping,
    isCheckingOut,
    checkout,
  };
}
