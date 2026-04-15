import { useEffect, useMemo, useRef } from 'react';

import type {
  Protocol,
  ProtocolAction,
  ProtocolGoal,
} from '@/features/protocol/api';
import { useSupplementCatalog } from '@/features/protocol/api/supplement-catalog';
import { useAnalytics } from '@/hooks/use-analytics';
import type { Product } from '@/types/api';

import { useSupplementProductLookup } from './use-supplement-product-lookup';

export type SupplementDisplayItem = {
  actionId: string;
  product: Product;
  amazonPrice: number | null;
  amazonUrl: string | null;
  whyContent: string | null;
};

export type GoalSupplementGroup = {
  goalId: string;
  goalTitle: string;
  items: SupplementDisplayItem[];
};

/**
 * Extract accepted supplement actions from a protocol, grouped by goal.
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
    const actions: {
      action: ProtocolAction;
      productId: string | undefined;
    }[] = [];

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

/**
 * Resolves a protocol's accepted supplement actions into display-ready groups
 * with product data, Amazon pricing, and OOS tracking.
 */
export function useSupplementGroups(protocol: Protocol | undefined) {
  const { lookup: getSupplementProduct, isMarketplaceLoading } =
    useSupplementProductLookup();
  const { data: catalog, isLoading: isCatalogLoading } = useSupplementCatalog();
  const { track } = useAnalytics();

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

  // Fire OOS analytics once
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

  const allItems = useMemo(
    () => goalGroups.flatMap((g) => g.items),
    [goalGroups],
  );

  return {
    goalGroups,
    allItems,
    isLoading: isCatalogLoading || isMarketplaceLoading,
  };
}
