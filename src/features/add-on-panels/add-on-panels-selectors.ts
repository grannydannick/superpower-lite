import {
  canAddOnItemToCart,
  hasCompletedAddOnItem,
  isPurchasedAddOnItem,
  isUntestedAddOnItem,
  shouldShowAddOnItemInMarketplace,
} from './add-on-panels-derived';
import type {
  AddOnGroup,
  AddOnItem,
  AddOnItemId,
  OnboardingAddOnsResponse,
} from './api/add-on-panels';

export const ALL_TESTS_FILTER_ID = 'all';
export const UNTESTED_FILTER_ID = 'untested';
const CORE_BLOOD_PANEL_GROUP_ID = 'blood-panels';
export type PanelFilterId =
  | OnboardingAddOnsResponse['filters'][number]['id']
  | typeof ALL_TESTS_FILTER_ID
  | typeof UNTESTED_FILTER_ID;

export function hasCompletedHistory(groups: AddOnGroup[]): boolean {
  for (const group of groups) {
    for (const item of getGroupItems(group)) {
      if (hasCompletedAddOnItem(item)) return true;
    }
  }
  return false;
}

export function getGroupItems(group: AddOnGroup): AddOnItem[] {
  if (group.selection.type === 'bundle-or-components') {
    const items: AddOnItem[] = [];
    if (group.selection.bundle != null) {
      items.push(group.selection.bundle);
    }
    for (const item of group.selection.components) {
      items.push(item);
    }
    return items;
  }
  return group.selection.items;
}

export function getPurchasedItems(groups: AddOnGroup[]) {
  const items: AddOnItem[] = [];
  const seenIds = new Set<AddOnItemId>();

  for (const group of groups) {
    for (const item of getGroupItems(group)) {
      if (!isPurchasedAddOnItem(item) || seenIds.has(item.id)) {
        continue;
      }

      items.push(item);
      seenIds.add(item.id);
    }
  }

  return items;
}

export function getMarketplaceGroups(
  groups: AddOnGroup[],
  options: {
    includeBaselineBloodPanels?: boolean;
    onlyPurchasable?: boolean;
  } = {},
) {
  const visibleGroups: AddOnGroup[] = [];

  for (const group of groups) {
    // The baseline and advanced blood panels are core products and normally
    // shouldn't appear in the add-on marketplace (they surface in the
    // purchased section when owned). In retest contexts they ARE the primary
    // target, so the caller can opt in.
    if (group.id === 'blood-panels' && !options.includeBaselineBloodPanels) {
      continue;
    }

    if (group.selection.type === 'bundle-or-components') {
      const bundle =
        group.selection.bundle != null &&
        (!options.onlyPurchasable
          ? shouldShowAddOnItemInMarketplace(group.selection.bundle)
          : canAddOnItemToCart(group.selection.bundle))
          ? group.selection.bundle
          : null;
      const components: AddOnItem[] = [];

      for (const component of group.selection.components) {
        const shouldIncludeComponent = !options.onlyPurchasable
          ? shouldShowAddOnItemInMarketplace(component)
          : canAddOnItemToCart(component);

        if (!shouldIncludeComponent) {
          continue;
        }

        components.push(component);
      }

      if (bundle == null && components.length === 0) {
        continue;
      }

      visibleGroups.push({
        ...group,
        selection: { ...group.selection, bundle, components },
      });
      continue;
    }

    const items: AddOnItem[] = [];

    for (const item of group.selection.items) {
      const shouldIncludeItem = !options.onlyPurchasable
        ? shouldShowAddOnItemInMarketplace(item)
        : canAddOnItemToCart(item);

      if (!shouldIncludeItem) {
        continue;
      }

      items.push(item);
    }

    if (items.length === 0) {
      continue;
    }

    visibleGroups.push({
      ...group,
      selection: { ...group.selection, items },
    });
  }

  return visibleGroups;
}

export interface ToggleIntent {
  select: AddOnItemId[];
  deselect: AddOnItemId[];
}

export function computeToggle(
  group: AddOnGroup,
  item: AddOnItem,
  selectedServiceIds: Set<AddOnItemId>,
): ToggleIntent {
  const isSelecting = !selectedServiceIds.has(item.id);

  if (!isSelecting) {
    return { select: [], deselect: [item.id] };
  }

  if (group.selection.type !== 'bundle-or-components') {
    return { select: [item.id], deselect: [] };
  }

  const { bundle, components } = group.selection;

  if (item.kind === 'complete-panel') {
    return {
      select: [item.id],
      deselect: components.map((c) => c.id),
    };
  }

  // Selecting a sub-panel: check if this completes the set. Collapse into the
  // bundle when it is still cart-eligible. Don't collapse if the bundle already
  // has coverage or pending work, since the user cannot purchase it again.
  const bundlePurchasable = bundle != null && canAddOnItemToCart(bundle);
  const allSiblingsSelected =
    bundlePurchasable &&
    components.every((c) => c.id === item.id || selectedServiceIds.has(c.id));

  if (allSiblingsSelected) {
    return {
      select: [bundle!.id],
      deselect: components.map((c) => c.id),
    };
  }

  return {
    select: [item.id],
    deselect: bundle != null ? [bundle.id] : [],
  };
}

export function getSelectedItems(
  groups: AddOnGroup[],
  selectedServiceIds: Set<AddOnItemId>,
) {
  const items: AddOnItem[] = [];

  for (const group of groups) {
    for (const item of getGroupItems(group)) {
      if (selectedServiceIds.has(item.id) && canAddOnItemToCart(item)) {
        items.push(item);
      }
    }
  }

  return items;
}

export function getFilteredGroups(
  groups: AddOnGroup[],
  activeFilterId: PanelFilterId,
  searchQuery: string,
): AddOnGroup[] {
  const query = searchQuery.trim().toLowerCase();
  const filtered: AddOnGroup[] = [];

  for (const group of groups) {
    if (
      activeFilterId !== ALL_TESTS_FILTER_ID &&
      activeFilterId !== UNTESTED_FILTER_ID &&
      group.filterId !== activeFilterId
    ) {
      continue;
    }

    const onlyUntested = activeFilterId === UNTESTED_FILTER_ID;
    if (onlyUntested && group.id === CORE_BLOOD_PANEL_GROUP_ID) {
      continue;
    }

    const matchItem = (item: AddOnItem) => {
      if (onlyUntested && !isUntestedAddOnItem(item)) return false;
      if (query.length === 0) return true;

      let haystack = `${group.label} ${item.name}`;
      const pd = item.productDetails;
      if (
        pd?.shortDescription != null &&
        pd.shortDescription.trim().length > 0
      ) {
        haystack += ` ${pd.shortDescription}`;
      }
      const rec = item.recommendation;
      if (rec?.reason != null && rec.reason.trim().length > 0) {
        haystack += ` ${rec.reason}`;
      }
      if (rec?.rationale != null) {
        for (const r of rec.rationale) {
          haystack += ` ${r.label}`;
        }
      }
      if (
        item.description != null &&
        item.description.trim().length > 0 &&
        (pd?.shortDescription == null ||
          pd.shortDescription.trim().length === 0)
      ) {
        haystack += ` ${item.description}`;
      }

      return haystack.toLowerCase().includes(query);
    };

    // Fast path: no active item-level filtering, pass the group as-is.
    if (!onlyUntested && query.length === 0) {
      filtered.push(group);
      continue;
    }

    if (group.selection.type === 'bundle-or-components') {
      const bundle =
        group.selection.bundle != null && matchItem(group.selection.bundle)
          ? group.selection.bundle
          : null;
      const components: AddOnItem[] = [];
      for (const component of group.selection.components) {
        if (matchItem(component)) {
          components.push(component);
        }
      }

      if (bundle != null || components.length > 0) {
        filtered.push({
          ...group,
          selection: { ...group.selection, bundle, components },
        });
      }
    } else {
      const items: AddOnItem[] = [];
      for (const item of group.selection.items) {
        if (matchItem(item)) {
          items.push(item);
        }
      }

      if (items.length > 0) {
        filtered.push({
          ...group,
          selection: { ...group.selection, items },
        });
      }
    }
  }

  return filtered;
}

export function findItemById(
  groups: AddOnGroup[],
  itemId: AddOnItemId,
): AddOnItem | null {
  for (const group of groups) {
    for (const item of getGroupItems(group)) {
      if (item.id === itemId) return item;
    }
  }
  return null;
}

export function findGroupByItemId(
  groups: AddOnGroup[],
  itemId: AddOnItemId,
): AddOnGroup | null {
  for (const group of groups) {
    for (const item of getGroupItems(group)) {
      if (item.id === itemId) return group;
    }
  }
  return null;
}

export function getCurrentRecommendation(
  addOnsData: OnboardingAddOnsResponse,
  recommendationIndex: number,
): AddOnGroup | null {
  const groupsById = new Map<string, AddOnGroup>();
  for (const group of addOnsData.groups) {
    groupsById.set(group.id, group);
  }

  const recommendedGroups: AddOnGroup[] = [];
  for (const groupId of addOnsData.recommendedGroupIds) {
    const group = groupsById.get(groupId);
    if (group != null) {
      recommendedGroups.push(group);
    }
  }

  return recommendedGroups[recommendationIndex] ?? null;
}
