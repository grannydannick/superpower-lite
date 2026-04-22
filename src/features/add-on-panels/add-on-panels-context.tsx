import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { toast } from '@/components/ui/sonner';
import { useCreateCredit } from '@/features/orders/api/credits';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { usePosthogFeatureFlagEnabled } from '@/hooks/use-posthog-feature-flag-enabled';
import { FeatureFlags } from '@/lib/posthog';

import {
  type SelectionChangeSource,
  useAddOnPanelsAnalytics,
} from './add-on-panels-analytics';
import {
  canAddOnItemToCart,
  isUntestedAddOnItem,
} from './add-on-panels-derived';
import {
  ALL_TESTS_FILTER_ID,
  computeToggle,
  findGroupByItemId,
  getSelectedItems,
  hasCompletedHistory,
  type PanelFilterId,
  UNTESTED_FILTER_ID,
} from './add-on-panels-selectors';
import type {
  AddOnPanelsStepVariant,
  MarketplaceCopy,
} from './add-on-panels-variants';
import {
  type AddOnGroup,
  type AddOnItem,
  type AddOnItemId,
  type OnboardingAddOnsResponse,
  getOnboardingAddOnsQueryOptions,
  useSuspenseOnboardingAddOns,
} from './api/add-on-panels';
import type { AddOnPanelsCartController } from './use-local-add-on-panels-cart';

interface FilterOption {
  id: PanelFilterId;
  label: string;
}

interface AddOnPanelsCoreContextValue {
  addOnsData: OnboardingAddOnsResponse;
  selectedServiceIds: Set<AddOnItemId>;
  proceed: () => Promise<void>;
  skip: () => void;
  goBack: () => void;
  isPending: boolean;
  hasPaymentMethodId: boolean;
  isFlexSelected: boolean;
  isSelectingPaymentMethod: boolean;
  applySelectionToggle: (
    group: AddOnGroup,
    item: AddOnItem,
    source: SelectionChangeSource,
  ) => void;
  removeItemFromCart: (item: AddOnItem) => void;
  showStepIndicator: boolean;
  marketplaceCopy: MarketplaceCopy;
  cartTitle: string;
  includeBaselineBloodPanels: boolean;
  showRecommendations: boolean;
  showOnlyPurchasableMarketplaceItems: boolean;
}

interface AddOnPanelsMarketplaceContextValue {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilterId: PanelFilterId;
  setActiveFilterId: (value: PanelFilterId) => void;
  filterOptions: FilterOption[];
  recommendationIndex: number;
  goToNextRecommendation: () => void;
}

interface AddOnPanelsCartContextValue {
  isCartExpanded: boolean;
  toggleCartExpanded: () => void;
}

interface AddOnPanelsDetailContextValue {
  detailItemId: AddOnItemId | null;
  openDetail: (itemId: AddOnItemId) => void;
  closeDetail: () => void;
}

interface AddOnPanelsUiState {
  searchQuery: string;
  activeFilterId: PanelFilterId;
  isCartExpanded: boolean;
  recommendationIndex: number;
  detailItemId: AddOnItemId | null;
}

interface SetSearchQueryAction {
  type: 'set-search-query';
  value: string;
}

interface SetActiveFilterIdAction {
  type: 'set-active-filter-id';
  value: PanelFilterId;
}

interface ToggleCartExpandedAction {
  type: 'toggle-cart-expanded';
}

interface GoToNextRecommendationAction {
  type: 'go-to-next-recommendation';
}

interface GoToPreviousRecommendationAction {
  type: 'go-to-previous-recommendation';
}

interface OpenDetailAction {
  type: 'open-detail';
  itemId: AddOnItemId;
}

interface CloseDetailAction {
  type: 'close-detail';
}

type AddOnPanelsUiAction =
  | SetSearchQueryAction
  | SetActiveFilterIdAction
  | ToggleCartExpandedAction
  | GoToNextRecommendationAction
  | GoToPreviousRecommendationAction
  | OpenDetailAction
  | CloseDetailAction;

const INITIAL_UI_STATE: AddOnPanelsUiState = {
  searchQuery: '',
  activeFilterId: ALL_TESTS_FILTER_ID,
  isCartExpanded: false,
  recommendationIndex: 0,
  detailItemId: null,
};

const AddOnPanelsCoreContext =
  createContext<AddOnPanelsCoreContextValue | null>(null);
const AddOnPanelsMarketplaceContext =
  createContext<AddOnPanelsMarketplaceContextValue | null>(null);
const AddOnPanelsCartContext =
  createContext<AddOnPanelsCartContextValue | null>(null);
const AddOnPanelsDetailContext =
  createContext<AddOnPanelsDetailContextValue | null>(null);

function addOnPanelsUiReducer(
  state: AddOnPanelsUiState,
  action: AddOnPanelsUiAction,
) {
  switch (action.type) {
    case 'set-search-query':
      return { ...state, searchQuery: action.value };
    case 'set-active-filter-id':
      return { ...state, activeFilterId: action.value };
    case 'toggle-cart-expanded':
      return { ...state, isCartExpanded: !state.isCartExpanded };
    case 'go-to-next-recommendation':
      return {
        ...state,
        recommendationIndex: state.recommendationIndex + 1,
      };
    case 'go-to-previous-recommendation':
      return {
        ...state,
        recommendationIndex: Math.max(0, state.recommendationIndex - 1),
      };
    case 'open-detail':
      return { ...state, detailItemId: action.itemId };
    case 'close-detail':
      return { ...state, detailItemId: null };
  }
}

export interface AddOnPanelsNavigation {
  next: () => void;
  prev: () => void;
}

interface AddOnPanelsStepProviderProps extends PropsWithChildren {
  navigation: AddOnPanelsNavigation;
  cart: AddOnPanelsCartController;
  variant: AddOnPanelsStepVariant;
}

export const AddOnPanelsStepProvider = ({
  children,
  navigation,
  cart,
  variant,
}: AddOnPanelsStepProviderProps) => {
  const { next, prev } = navigation;
  const {
    selectedServiceIds,
    addService,
    applyToggle,
    clear,
    hasInitializedRecommendedSelections,
    markRecommendedSelectionsInitialized,
  } = cart;
  const [uiState, dispatch] = useReducer(
    addOnPanelsUiReducer,
    INITIAL_UI_STATE,
  );
  const { data: addOnsData } = useSuspenseOnboardingAddOns({
    collectionMethod: variant.collectionMethod,
  });
  const queryClient = useQueryClient();
  const { activePaymentMethod, isFlexSelected, isSelectingPaymentMethod } =
    usePaymentMethodSelection();
  const createCreditMutation = useCreateCredit();
  const analyticsContext = useMemo(
    () => ({ flowContext: variant.flowContext }),
    [variant.flowContext],
  );

  const analytics = useAddOnPanelsAnalytics({
    addOnsData,
    selectedServiceIds,
    analyticsContext,
  });

  const preselectEnabled = usePosthogFeatureFlagEnabled(
    FeatureFlags.OnboardingAddOnsEnablePreselect,
  );

  useEffect(() => {
    if (!variant.showRecommendations) {
      markRecommendedSelectionsInitialized();
      return;
    }
    if (hasInitializedRecommendedSelections) return;
    if (preselectEnabled === undefined) return;

    if (preselectEnabled) {
      for (const group of addOnsData.groups) {
        if (group.selection.type !== 'bundle-or-components') continue;
        const { bundle, components } = group.selection;
        if (bundle == null || !isUntestedAddOnItem(bundle)) continue;
        if (components.length === 0) continue;
        if (
          components.every((c) => c.isRecommended && isUntestedAddOnItem(c))
        ) {
          addService(bundle.id);
        }
      }
    }

    markRecommendedSelectionsInitialized();
  }, [
    addOnsData.groups,
    addService,
    preselectEnabled,
    hasInitializedRecommendedSelections,
    markRecommendedSelectionsInitialized,
    variant.showRecommendations,
  ]);

  const setSearchQuery = useCallback((value: string) => {
    dispatch({ type: 'set-search-query', value });
  }, []);
  const setActiveFilterId = useCallback((value: PanelFilterId) => {
    dispatch({ type: 'set-active-filter-id', value });
  }, []);
  const toggleCartExpanded = useCallback(() => {
    dispatch({ type: 'toggle-cart-expanded' });
  }, []);
  const goToNextRecommendation = useCallback(() => {
    dispatch({ type: 'go-to-next-recommendation' });
  }, []);
  const openDetail = useCallback((itemId: AddOnItemId) => {
    dispatch({ type: 'open-detail', itemId });
  }, []);
  const closeDetail = useCallback(() => {
    dispatch({ type: 'close-detail' });
  }, []);

  const filterOptions = useMemo(() => {
    const baseFilterOptions: FilterOption[] = [];
    for (const filter of addOnsData.filters) {
      if (filter.id === 'blood-panels') {
        continue;
      }

      baseFilterOptions.push({
        id: filter.id,
        label: filter.label,
      });
    }

    const showUntestedFilter =
      variant.showUntestedSignals && hasCompletedHistory(addOnsData.groups);
    if (!showUntestedFilter) {
      return baseFilterOptions;
    }

    return [
      ...baseFilterOptions,
      { id: UNTESTED_FILTER_ID, label: 'Untested' },
    ];
  }, [addOnsData.filters, addOnsData.groups, variant.showUntestedSignals]);

  const hasPaymentMethodId =
    activePaymentMethod?.externalPaymentMethodId != null;

  const applySelectionToggle = useCallback(
    (group: AddOnGroup, item: AddOnItem, source: SelectionChangeSource) => {
      if (!canAddOnItemToCart(item)) return;
      const isAdding = !selectedServiceIds.has(item.id);
      const intent = computeToggle(group, item, selectedServiceIds);
      applyToggle(intent.select, intent.deselect);
      if (isAdding) {
        analytics.trackItemAdded(item, intent, source);
        return;
      }

      analytics.trackItemRemoved(item, intent, source);
    },
    [analytics, applyToggle, selectedServiceIds],
  );

  const removeItemFromCart = useCallback(
    (item: AddOnItem) => {
      const group = findGroupByItemId(addOnsData.groups, item.id);
      if (group == null) return;
      applySelectionToggle(group, item, 'cart');
    },
    [addOnsData.groups, applySelectionToggle],
  );

  const goBack = useCallback(() => {
    if (uiState.recommendationIndex > 0) {
      dispatch({ type: 'go-to-previous-recommendation' });
      return;
    }

    prev();
  }, [prev, uiState.recommendationIndex]);

  const skip = useCallback(() => {
    clear();
    next();
  }, [clear, next]);

  const proceed = useCallback(async () => {
    const selectedItems = getSelectedItems(
      addOnsData.groups,
      selectedServiceIds,
    );
    if (selectedItems.length === 0) {
      if (selectedServiceIds.size > 0) clear();
      next();
      return;
    }

    const paymentMethodId = activePaymentMethod?.externalPaymentMethodId;
    if (paymentMethodId == null) {
      toast.error('No payment method available');
      return;
    }

    const serviceIds: AddOnItemId[] = [];
    for (const item of selectedItems) {
      serviceIds.push(item.id);
    }

    const paymentProvider = activePaymentMethod?.paymentProvider ?? 'unknown';

    try {
      await createCreditMutation.mutateAsync({
        data: { serviceIds, paymentMethodId },
      });
    } catch (error) {
      analytics.trackPurchaseFailed({
        items: selectedItems,
        paymentProvider,
        errorMessage: error instanceof Error ? error.message : null,
      });
      toast.error('Purchase failed. Please try again later.');
      return;
    }

    analytics.trackPurchased({
      items: selectedItems,
      paymentProvider,
    });
    await queryClient.invalidateQueries({
      queryKey: getOnboardingAddOnsQueryOptions({
        collectionMethod: variant.collectionMethod,
      }).queryKey,
    });

    toast.success('Purchase successful');
    clear();
    next();
  }, [
    activePaymentMethod?.externalPaymentMethodId,
    activePaymentMethod?.paymentProvider,
    addOnsData.groups,
    analytics,
    clear,
    createCreditMutation,
    next,
    queryClient,
    selectedServiceIds,
    variant.collectionMethod,
  ]);

  const coreValue = useMemo(
    () => ({
      addOnsData,
      selectedServiceIds,
      proceed,
      skip,
      goBack,
      isPending: createCreditMutation.isPending,
      hasPaymentMethodId,
      isFlexSelected,
      isSelectingPaymentMethod,
      applySelectionToggle,
      removeItemFromCart,
      showStepIndicator: variant.showStepIndicator,
      marketplaceCopy: variant.marketplaceCopy,
      cartTitle: variant.cartTitle,
      includeBaselineBloodPanels: variant.includeBaselineBloodPanels,
      showRecommendations: variant.showRecommendations,
      showOnlyPurchasableMarketplaceItems:
        variant.showOnlyPurchasableMarketplaceItems,
    }),
    [
      addOnsData,
      selectedServiceIds,
      proceed,
      skip,
      goBack,
      createCreditMutation.isPending,
      hasPaymentMethodId,
      isFlexSelected,
      isSelectingPaymentMethod,
      applySelectionToggle,
      removeItemFromCart,
      variant.showStepIndicator,
      variant.marketplaceCopy,
      variant.cartTitle,
      variant.includeBaselineBloodPanels,
      variant.showRecommendations,
      variant.showOnlyPurchasableMarketplaceItems,
    ],
  );
  const marketplaceValue = useMemo(
    () => ({
      searchQuery: uiState.searchQuery,
      setSearchQuery,
      activeFilterId: uiState.activeFilterId,
      setActiveFilterId,
      filterOptions,
      recommendationIndex: uiState.recommendationIndex,
      goToNextRecommendation,
    }),
    [
      uiState.searchQuery,
      uiState.activeFilterId,
      uiState.recommendationIndex,
      setSearchQuery,
      setActiveFilterId,
      filterOptions,
      goToNextRecommendation,
    ],
  );
  const cartValue = useMemo(
    () => ({
      isCartExpanded: uiState.isCartExpanded,
      toggleCartExpanded,
    }),
    [uiState.isCartExpanded, toggleCartExpanded],
  );
  const detailValue = useMemo(
    () => ({
      detailItemId: uiState.detailItemId,
      openDetail,
      closeDetail,
    }),
    [uiState.detailItemId, openDetail, closeDetail],
  );

  return (
    <AddOnPanelsCoreContext.Provider value={coreValue}>
      <AddOnPanelsMarketplaceContext.Provider value={marketplaceValue}>
        <AddOnPanelsCartContext.Provider value={cartValue}>
          <AddOnPanelsDetailContext.Provider value={detailValue}>
            {children}
          </AddOnPanelsDetailContext.Provider>
        </AddOnPanelsCartContext.Provider>
      </AddOnPanelsMarketplaceContext.Provider>
    </AddOnPanelsCoreContext.Provider>
  );
};

export const useAddOnPanelsCore = () => {
  const value = useContext(AddOnPanelsCoreContext);
  if (value == null) {
    throw new Error(
      'useAddOnPanelsCore must be used within AddOnPanelsStepProvider',
    );
  }
  return value;
};

export const useAddOnPanelsMarketplace = () => {
  const value = useContext(AddOnPanelsMarketplaceContext);
  if (value == null) {
    throw new Error(
      'useAddOnPanelsMarketplace must be used within AddOnPanelsStepProvider',
    );
  }
  return value;
};

export const useAddOnPanelsCart = () => {
  const value = useContext(AddOnPanelsCartContext);
  if (value == null) {
    throw new Error(
      'useAddOnPanelsCart must be used within AddOnPanelsStepProvider',
    );
  }
  return value;
};

export const useAddOnPanelsDetail = () => {
  const value = useContext(AddOnPanelsDetailContext);
  if (value == null) {
    throw new Error(
      'useAddOnPanelsDetail must be used within AddOnPanelsStepProvider',
    );
  }
  return value;
};
