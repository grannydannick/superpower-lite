import type { AddOnCollectionMethod } from './api/add-on-panels';

export interface MarketplaceCopy {
  title: string;
  subtitle?: string;
}

export interface AddOnPanelsStepVariant {
  flowContext: 'onboarding' | 'schedule_addons' | 'schedule_retest';
  collectionMethod?: AddOnCollectionMethod;
  showStepIndicator: boolean;
  marketplaceCopy: MarketplaceCopy;
  cartTitle: string;
  includeBaselineBloodPanels: boolean;
  showUntestedSignals: boolean;
  showRecommendations: boolean;
  showOnlyPurchasableMarketplaceItems: boolean;
}

const DEFAULT_MARKETPLACE_COPY: MarketplaceCopy = {
  title: 'Explore tests',
};

export const ADD_ON_PANELS_STEP_VARIANTS = {
  onboarding: {
    flowContext: 'onboarding',
    showStepIndicator: false,
    marketplaceCopy: DEFAULT_MARKETPLACE_COPY,
    cartTitle: 'Your tests',
    includeBaselineBloodPanels: false,
    showUntestedSignals: false,
    showRecommendations: true,
    showOnlyPurchasableMarketplaceItems: false,
  },
  scheduleAddOns: {
    flowContext: 'schedule_addons',
    collectionMethod: 'phlebotomy',
    showStepIndicator: true,
    marketplaceCopy: {
      title: 'Add to your test',
      subtitle:
        'Add detailed testing to your upcoming blood draw. Results come back alongside your core panel.',
    },
    cartTitle: 'Your add-on tests',
    includeBaselineBloodPanels: false,
    showUntestedSignals: true,
    showRecommendations: false,
    showOnlyPurchasableMarketplaceItems: true,
  },
  scheduleRetest: {
    flowContext: 'schedule_retest',
    collectionMethod: 'phlebotomy',
    showStepIndicator: true,
    marketplaceCopy: {
      title: 'Retest your panels',
      subtitle:
        'Pick any tests to reorder or add something new. You’ll schedule your blood draw after checkout.',
    },
    cartTitle: 'Your selected tests',
    includeBaselineBloodPanels: true,
    showUntestedSignals: true,
    showRecommendations: false,
    showOnlyPurchasableMarketplaceItems: false,
  },
} satisfies Record<string, AddOnPanelsStepVariant>;
