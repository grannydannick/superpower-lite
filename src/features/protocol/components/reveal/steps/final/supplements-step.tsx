import { IconCheckCircle2 } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCheckCircle2';
import { m } from 'framer-motion';
import { ChevronRight, Minus, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import NumberFlow from '@/components/shared/number-flow';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import type {
  Protocol,
  ProtocolAction,
  ProtocolGoal,
} from '@/features/protocol/api';
import { useSupplementCatalog } from '@/features/protocol/api/supplement-catalog';
import { ProtocolMarkdown } from '@/features/protocol/components/protocol-markdown';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';
import { useShippingFee } from '@/features/protocol/hooks/use-shipping-fee';
import { useSupplementProductLookup } from '@/features/protocol/hooks/use-supplement-product-lookup';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';
import type { Product } from '@/types/api';

import { ProtocolStepLayout } from '../../../layouts/protocol-step-layout';

const MAX_SUPPLEMENT_QUANTITY = 10;

type SupplementDisplayItem = {
  actionId: string;
  product: Product;
  amazonPrice: number | null;
  amazonUrl: string | null;
  whyContent: string | null;
};

type GoalSupplementGroup = {
  goalId: string;
  goalTitle: string;
  items: SupplementDisplayItem[];
};

type SupplementCardProps = {
  item: SupplementDisplayItem;
  quantity: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  index: number;
};

const SupplementCard = ({
  item,
  quantity,
  onIncrement,
  onDecrement,
  index,
}: SupplementCardProps) => {
  const { track } = useAnalytics();

  const productMeta = useMemo(
    () => ({
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      discounted_price: item.product.price * (1 - item.product.discount / 100),
      product_url: item.product.url,
      action_id: item.actionId,
    }),
    [item.product, item.actionId],
  );

  const handleAmazonClick = useCallback(() => {
    track('protocol_reveal_supplement_amazon_viewed', {
      ...productMeta,
      amazon_price: item.amazonPrice,
      amazon_url: item.amazonUrl,
    });
    window.open(item.amazonUrl!, '_blank', 'noopener');
  }, [track, productMeta, item.amazonPrice, item.amazonUrl]);

  const { product } = item;
  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className="rounded-2xl border border-zinc-200 bg-white shadow shadow-black/[.03]"
    >
      <div className="p-4">
        {/* Header: product name + image */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="text-base font-semibold text-zinc-900">
            {product.name}
          </span>
          <img
            src={product.image ?? '/protocol/decision/empty.webp'}
            alt={product.name}
            className="size-12 shrink-0 rounded-lg object-cover"
          />
        </div>

        {/* Superpower + Amazon pricing grid */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3">
          {/* Superpower row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-900">
              Superpower
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-vermillion-900">
                ${discountedPrice.toFixed(0)}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-zinc-400 line-through">
                  ${product.price.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center rounded-lg border border-zinc-200">
            <button
              type="button"
              className="flex size-8 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 disabled:opacity-30"
              onClick={() => onDecrement(item.actionId)}
              disabled={quantity <= 0}
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-medium tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              className="flex size-8 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 disabled:opacity-30"
              onClick={() => onIncrement(item.actionId)}
              disabled={quantity >= MAX_SUPPLEMENT_QUANTITY}
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Amazon row — price aligns under Superpower prices */}
          {item.amazonPrice != null && item.amazonUrl != null && (
            <>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-secondary transition-colors hover:text-zinc-700"
                  onClick={handleAmazonClick}
                >
                  View on Amazon
                  <ChevronRight className="size-3.5" />
                </button>
                <span className="text-sm text-secondary">
                  ${item.amazonPrice.toFixed(0)}
                </span>
              </div>
              {/* Empty cell to keep grid alignment */}
              <div />
            </>
          )}
        </div>
      </div>

      {/* Why we recommend accordion */}
      {item.whyContent && (
        <Accordion type="single" collapsible>
          <AccordionItem value="why" className="border-b-0 border-t">
            <AccordionTrigger className="px-4 py-3 text-sm font-medium">
              Why we recommend this for you?
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <ProtocolMarkdown
                content={item.whyContent}
                className="text-sm text-secondary [&>div]:mb-0"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </m.div>
  );
};

/**
 * Extract supplement actions grouped by goal.
 */
const extractSupplementsByGoal = (
  protocol: Protocol,
): {
  goal: ProtocolGoal;
  actions: { action: ProtocolAction; productId: string | undefined }[];
}[] => {
  const groups: {
    goal: ProtocolGoal;
    actions: { action: ProtocolAction; productId: string | undefined }[];
  }[] = [];

  for (const goal of protocol.goals) {
    const actions: { action: ProtocolAction; productId: string | undefined }[] =
      [];

    if (
      goal.primaryAction.content.type === 'supplement' &&
      goal.primaryAction.accepted === true
    ) {
      actions.push({
        action: goal.primaryAction,
        productId: goal.primaryAction.content.productId,
      });
    }

    for (const action of goal.additionalActions ?? []) {
      if (action.content.type === 'supplement' && action.accepted === true) {
        actions.push({
          action,
          productId: action.content.productId,
        });
      }
    }

    if (actions.length > 0) {
      groups.push({ goal, actions });
    }
  }

  return groups;
};

export const SupplementsStep = () => {
  const { next, protocol, saveShopifyOrder } = useProtocolStepperContext();
  const { track } = useAnalytics();
  const getSupplementProduct = useSupplementProductLookup();
  const { data: catalog, isLoading: isCatalogLoading } = useSupplementCatalog();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Track quantities per action ID — pre-select all with qty 1
  const [quantities, setQuantities] = useState<Map<string, number> | null>(
    null,
  );

  // Build Amazon pricing lookup from catalog (by variant ID)
  const amazonLookup = useMemo(() => {
    const byId = new Map<string, { amazonPrice: number; amazonUrl: string }>();
    for (const item of catalog ?? []) {
      byId.set(item.shopifyVariantId, {
        amazonPrice: item.amazonPrice,
        amazonUrl: item.amazonUrl,
      });
    }
    return byId;
  }, [catalog]);

  // Extract supplements grouped by goal, tracking out-of-stock items
  const { goalGroups, outOfStockSupplements } = useMemo(() => {
    if (!protocol)
      return {
        goalGroups: [] as GoalSupplementGroup[],
        outOfStockSupplements: [] as {
          actionId: string;
          productId: string;
          productName: string;
        }[],
      };

    const outOfStock: {
      actionId: string;
      productId: string;
      productName: string;
    }[] = [];

    const rawGroups = extractSupplementsByGoal(protocol);
    const result: GoalSupplementGroup[] = [];

    for (const { goal, actions } of rawGroups) {
      const items: SupplementDisplayItem[] = [];

      for (const { action, productId } of actions) {
        const product = getSupplementProduct(productId);
        if (product === null) continue;

        if (
          product.inventoryQuantity !== undefined &&
          product.inventoryQuantity <= 0
        ) {
          outOfStock.push({
            actionId: action.id,
            productId: product.id,
            productName: product.name,
          });
          continue;
        }

        const amazon = amazonLookup.get(product.id);
        const whyContent =
          action.content.type === 'supplement' ? action.content.why : null;

        items.push({
          actionId: action.id,
          product,
          amazonPrice: amazon?.amazonPrice ?? null,
          amazonUrl: amazon?.amazonUrl ?? null,
          whyContent,
        });
      }

      if (items.length > 0) {
        result.push({
          goalId: goal.id,
          goalTitle: goal.title,
          items,
        });
      }
    }

    return { goalGroups: result, outOfStockSupplements: outOfStock };
  }, [protocol, getSupplementProduct, amazonLookup]);

  const hasTrackedOutOfStock = useRef(false);
  useEffect(() => {
    if (outOfStockSupplements.length === 0 || hasTrackedOutOfStock.current)
      return;
    hasTrackedOutOfStock.current = true;
    for (const item of outOfStockSupplements) {
      track('protocol_reveal_supplement_out_of_stock', {
        action_id: item.actionId,
        product_id: item.productId,
        product_name: item.productName,
      });
    }
  }, [outOfStockSupplements, track]);

  // Flat list for totals
  const allItems = useMemo(
    () => goalGroups.flatMap((g) => g.items),
    [goalGroups],
  );

  const allIds = useMemo(
    () => new Set(allItems.map((s) => s.actionId)),
    [allItems],
  );

  // Default quantities: 1 for each item
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

  const handleIncrement = useCallback(
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

  const handleDecrement = useCallback(
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

  const { shippingCents, totalWithShipping, isFree } =
    useShippingFee(totalDiscounted);

  const handlePurchase = useCallback(async () => {
    const selected = allItems.filter((s) => getQuantity(s.actionId) > 0);
    if (selected.length === 0) return;

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
      total_with_shipping_cents: totalWithShipping,
    });

    setIsCheckingOut(true);

    try {
      // One entry per quantity unit (backend strictObject doesn't accept quantity field yet)
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
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank', 'noopener');
        saveShopifyOrder(response.orderId, checkoutUrl).catch(() => {});
      }

      setIsCheckingOut(false);
      next();
    } catch (error) {
      console.error('Failed to create checkout:', error);
      setIsCheckingOut(false);
      next();
    }
  }, [
    allItems,
    getQuantity,
    next,
    track,
    totalDiscounted,
    totalOriginal,
    totalWithShipping,
    saveShopifyOrder,
  ]);

  const handleSkip = useCallback(() => {
    track('protocol_reveal_supplement_no_thanks_clicked', {
      total_supplements_available: allItems.length,
      selected_count: selectedCount,
    });
    next();
  }, [next, track, allItems.length, selectedCount]);

  if (isCatalogLoading) {
    return (
      <ProtocolStepLayout>
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      </ProtocolStepLayout>
    );
  }

  const hasSelectedSupplements = selectedCount > 0;

  const groupOffsets: number[] = [];
  let offset = 0;
  for (const group of goalGroups) {
    groupOffsets.push(offset);
    offset += group.items.length;
  }

  return (
    <ProtocolStepLayout>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-2xl"
      >
        <div className="mb-8">
          <H2 className="mb-2">
            Let&apos;s help you source the right supplements
          </H2>
          <Body1 className="text-secondary">
            These specific supplements have been curated and verified by
            Superpower. You can source different brands with your own research.
          </Body1>
        </div>

        <div className="space-y-8">
          {goalGroups.map((group, groupIdx) => (
            <div key={group.goalId} className="space-y-4">
              {/* Goal section title */}
              <div className="flex items-start gap-3">
                <IconCheckCircle2 className="mt-0.5 size-5 shrink-0 text-vermillion-900" />
                <span className="text-base font-semibold text-zinc-900">
                  {group.goalTitle}
                </span>
              </div>

              {/* Supplement cards for this goal */}
              {group.items.map((item, itemIdx) => (
                <SupplementCard
                  key={item.actionId}
                  item={item}
                  quantity={getQuantity(item.actionId)}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  index={groupOffsets[groupIdx] + itemIdx}
                />
              ))}
            </div>
          ))}
        </div>

        <hr className="mt-8 border-zinc-200" />

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Shipping</span>
            <span className="font-medium text-vermillion-900">
              {isFree ? (
                'FREE'
              ) : (
                <NumberFlow prefix="$" value={shippingCents / 100} />
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <span className="text-sm text-secondary">Total</span>
              {hasSelectedSupplements && (
                <Badge
                  variant="vermillion"
                  className="rounded-sm bg-vermillion-900/10 text-xs"
                >
                  20% member discount
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {totalOriginal !== totalDiscounted && hasSelectedSupplements && (
                <span className="text-sm text-zinc-400 line-through">
                  <NumberFlow
                    value={totalOriginal / 100}
                    prefix="$"
                    format={{
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                  />
                </span>
              )}
              <span className="text-base font-bold text-vermillion-900">
                <NumberFlow
                  value={totalWithShipping / 100}
                  prefix="$"
                  format={{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }}
                />
              </span>
            </div>
          </div>
        </div>
      </m.div>

      <div className="flex flex-col items-center gap-3">
        <Button
          className="w-full gap-2"
          onClick={handlePurchase}
          disabled={!hasSelectedSupplements || isCheckingOut}
        >
          {isCheckingOut ? 'Creating checkout...' : 'Purchase now'}
          {!isCheckingOut && hasSelectedSupplements && (
            <span className="text-zinc-500">
              <NumberFlow
                value={totalWithShipping / 100}
                prefix="$"
                format={{
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }}
              />
            </span>
          )}
        </Button>
        <button
          type="button"
          className="text-sm text-secondary transition-colors hover:text-zinc-700 disabled:opacity-50"
          onClick={handleSkip}
          disabled={isCheckingOut}
        >
          Skip for now
        </button>
      </div>
    </ProtocolStepLayout>
  );
};
