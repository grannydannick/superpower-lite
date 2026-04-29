import type { AddOnItem } from './api/add-on-panels';

export type AddOnItemDisplayBadgeTone =
  | 'included'
  | 'purchased'
  | 'recommended'
  | 'in-progress'
  | 'completed';

interface AddOnItemDisplayBadge {
  label: string;
  tone: AddOnItemDisplayBadgeTone;
}

export interface AddOnItemMetaLabel {
  kind: 'history' | 'coverage';
  label: string;
}

interface GetAddOnItemPresentationOptions {
  recommendedBadgeLabel?: string;
}

interface HistoricalTestingLabelInput {
  resultsPostedAt: string | null;
  completedByServiceName: string | null;
}

const HISTORY_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: '2-digit',
});

function formatHistoricalTestingLabel(item: HistoricalTestingLabelInput) {
  const hasServiceName =
    item.completedByServiceName != null &&
    item.completedByServiceName.trim().length > 0;

  if (item.resultsPostedAt == null) {
    if (!hasServiceName) return null;
    return `Last tested ${item.completedByServiceName}`;
  }

  const parsed = new Date(item.resultsPostedAt);
  if (Number.isNaN(parsed.getTime())) {
    if (!hasServiceName) return null;
    return `Last tested ${item.completedByServiceName}`;
  }

  const formattedDate = HISTORY_DATE_FORMATTER.format(parsed);

  if (hasServiceName) {
    return `Last tested ${formattedDate} · ${item.completedByServiceName}`;
  }

  return `Last tested ${formattedDate}`;
}

function formatCoveredByLabel(coveringServiceNames: string[]) {
  const uniqueNames: string[] = [];

  for (const serviceName of coveringServiceNames) {
    const normalizedName = serviceName.trim();
    if (normalizedName.length === 0) continue;
    if (uniqueNames.includes(normalizedName)) continue;
    uniqueNames.push(normalizedName);
  }

  if (uniqueNames.length === 0) return null;
  if (uniqueNames.length === 1) return `Covered by ${uniqueNames[0]}`;
  if (uniqueNames.length === 2) {
    return `Covered by ${uniqueNames[0]} & ${uniqueNames[1]}`;
  }

  let joinedNames = '';
  for (const [index, serviceName] of uniqueNames.entries()) {
    if (index === 0) {
      joinedNames = serviceName;
      continue;
    }

    if (index === uniqueNames.length - 1) {
      joinedNames += ` & ${serviceName}`;
      continue;
    }

    joinedNames += `, ${serviceName}`;
  }

  return `Covered by ${joinedNames}`;
}

export function getAddOnItemEntitlementState(item: AddOnItem) {
  if (item.entitlement?.status != null) {
    return item.entitlement.status;
  }

  if (item.status === 'purchased') {
    return 'purchased';
  }

  if (item.status === 'in-progress') {
    return 'in-progress';
  }

  if (item.status === 'included') {
    return 'included';
  }

  return 'available';
}

export function getAddOnItemCompletionState(item: AddOnItem) {
  if (item.completion?.lastCompletedAt != null) {
    return 'completed';
  }

  if (item.status === 'completed') {
    return 'completed';
  }

  return 'none';
}

export function canAddOnItemToCart(item: AddOnItem) {
  return getAddOnItemEntitlementState(item) === 'available';
}

export function hasCompletedAddOnItem(item: AddOnItem) {
  return getAddOnItemCompletionState(item) === 'completed';
}

export function isUntestedAddOnItem(item: AddOnItem) {
  return (
    canAddOnItemToCart(item) && getAddOnItemCompletionState(item) === 'none'
  );
}

export function isPurchasedAddOnItem(item: AddOnItem) {
  return getAddOnItemEntitlementState(item) === 'purchased';
}

export function shouldShowAddOnItemInMarketplace(item: AddOnItem) {
  return !isPurchasedAddOnItem(item);
}

function getAddOnItemDisplayBadge(item: AddOnItem) {
  const entitlementState = getAddOnItemEntitlementState(item);
  const completionState = getAddOnItemCompletionState(item);
  const entitlementSource = item.entitlement?.source ?? null;

  if (entitlementState === 'purchased') {
    const badge = {
      label: 'Purchased',
      tone: 'purchased',
    } satisfies AddOnItemDisplayBadge;
    return badge;
  }

  if (entitlementState === 'in-progress') {
    const badge = {
      label: 'Results pending',
      tone: 'in-progress',
    } satisfies AddOnItemDisplayBadge;
    return badge;
  }

  if (entitlementState === 'included') {
    if (entitlementSource === 'bundle') {
      const badge = {
        label: 'Included in your credit',
        tone: 'included',
      } satisfies AddOnItemDisplayBadge;
      return badge;
    }

    if (entitlementSource === 'overlap') {
      const badge = {
        label: 'Already covered',
        tone: 'included',
      } satisfies AddOnItemDisplayBadge;
      return badge;
    }

    const badge = {
      label: 'Included',
      tone: 'included',
    } satisfies AddOnItemDisplayBadge;
    return badge;
  }

  if (completionState === 'completed') {
    const badge = {
      label: 'Retest',
      tone: 'completed',
    } satisfies AddOnItemDisplayBadge;
    return badge;
  }

  if (item.isRecommended && item.kind !== 'complete-panel') {
    const badge = {
      label: 'Recommended',
      tone: 'recommended',
    } satisfies AddOnItemDisplayBadge;
    return badge;
  }

  return null;
}

function getAddOnItemMetaLabels(item: AddOnItem) {
  const metaLabels: AddOnItemMetaLabel[] = [];
  const entitlementState = getAddOnItemEntitlementState(item);
  const coveredByLabel = formatCoveredByLabel(
    item.entitlement?.coveringServiceNames ?? [],
  );

  if (entitlementState === 'included' && coveredByLabel != null) {
    metaLabels.push({
      kind: 'coverage',
      label: coveredByLabel,
    });
  }

  const historyLabel = formatHistoricalTestingLabel({
    resultsPostedAt: item.completion?.lastCompletedAt ?? null,
    completedByServiceName: item.completion?.completedByServiceName ?? null,
  });
  if (historyLabel != null) {
    metaLabels.push({
      kind: 'history',
      label: historyLabel,
    });
  }

  return metaLabels;
}

export function getAddOnItemPresentation(
  item: AddOnItem,
  options: GetAddOnItemPresentationOptions = {},
) {
  const badge = getAddOnItemDisplayBadge(item);
  const metaLabels = getAddOnItemMetaLabels(item);

  if (badge?.tone === 'recommended' && options.recommendedBadgeLabel != null) {
    const recommendedBadge = {
      ...badge,
      label: options.recommendedBadgeLabel,
    } satisfies AddOnItemDisplayBadge;

    return {
      badge: recommendedBadge,
      metaLabels,
    };
  }

  return {
    badge,
    metaLabels,
  };
}

export function canOpenAddOnItemDetail(item: AddOnItem) {
  return item.productDetails != null;
}
