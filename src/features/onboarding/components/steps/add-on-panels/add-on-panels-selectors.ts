import type {
  AddOnGroup,
  AddOnItem,
  AddOnItemId,
  OnboardingAddOnsResponse,
} from '@/features/onboarding/api/onboarding-add-ons';

export const ALL_TESTS_FILTER_ID = 'all';
export type PanelFilterId =
  | OnboardingAddOnsResponse['filters'][number]['id']
  | typeof ALL_TESTS_FILTER_ID;

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

function isPurchasedItem(item: AddOnItem) {
  return item.status === 'purchased';
}

export function getPurchasedItems(groups: AddOnGroup[]) {
  const items: AddOnItem[] = [];
  const seenIds = new Set<AddOnItemId>();

  for (const group of groups) {
    for (const item of getGroupItems(group)) {
      if (!isPurchasedItem(item) || seenIds.has(item.id)) {
        continue;
      }

      items.push(item);
      seenIds.add(item.id);
    }
  }

  return items;
}

export function getMarketplaceGroups(groups: AddOnGroup[]) {
  const visibleGroups: AddOnGroup[] = [];

  for (const group of groups) {
    if (group.selection.type === 'bundle-or-components') {
      const bundle =
        group.selection.bundle != null &&
        !isPurchasedItem(group.selection.bundle)
          ? group.selection.bundle
          : null;
      const components: AddOnItem[] = [];

      for (const component of group.selection.components) {
        if (isPurchasedItem(component)) {
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
      if (isPurchasedItem(item)) {
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

  // Selecting a sub-panel: check if this completes the set
  const allSiblingsSelected =
    bundle != null &&
    bundle.status === 'available' &&
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
      if (selectedServiceIds.has(item.id) && item.status === 'available') {
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
      group.filterId !== activeFilterId
    ) {
      continue;
    }

    if (query.length === 0) {
      filtered.push(group);
      continue;
    }

    const matchItem = (item: AddOnItem) =>
      `${group.label} ${item.name} ${item.description ?? ''}`
        .toLowerCase()
        .includes(query);

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
