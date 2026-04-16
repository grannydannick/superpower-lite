import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useShallow } from 'zustand/react/shallow';

import { toast } from '@/components/ui/sonner';
import {
  type AddOnGroup,
  type AddOnItem,
  type AddOnItemId,
  type OnboardingAddOnsResponse,
  useSuspenseOnboardingAddOns,
} from '@/features/onboarding/api/onboarding-add-ons';
import { useOnboardingNavigation } from '@/features/onboarding/hooks/use-onboarding-navigation';
import { useOnboardingCartStore } from '@/features/onboarding/stores/onboarding-cart-store';
import { useCreateCredit } from '@/features/orders/api/credits';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { usePosthogFeatureFlagEnabled } from '@/hooks/use-posthog-feature-flag-enabled';
import { FeatureFlags } from '@/lib/posthog';

import {
  type SelectionChangeSource,
  useAddOnPanelsAnalytics,
} from './add-on-panels-analytics';
import {
  ALL_TESTS_FILTER_ID,
  computeToggle,
  findGroupByItemId,
  getSelectedItems,
  type PanelFilterId,
} from './add-on-panels-selectors';

interface FilterOption {
  id: PanelFilterId;
  label: string;
}

interface AddOnPanelsStepContextValue {
  addOnsData: OnboardingAddOnsResponse;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilterId: PanelFilterId;
  setActiveFilterId: (value: PanelFilterId) => void;
  isCartExpanded: boolean;
  toggleCartExpanded: () => void;
  recommendationIndex: number;
  goToNextRecommendation: () => void;
  proceed: () => Promise<void>;
  skip: () => void;
  goBack: () => void;
  isPending: boolean;
  hasPaymentMethodId: boolean;
  isFlexSelected: boolean;
  isSelectingPaymentMethod: boolean;
  filterOptions: FilterOption[];
  detailItemId: AddOnItemId | null;
  openDetail: (itemId: AddOnItemId) => void;
  closeDetail: () => void;
  applySelectionToggle: (
    group: AddOnGroup,
    item: AddOnItem,
    source: SelectionChangeSource,
  ) => void;
  removeItemFromCart: (item: AddOnItem) => void;
}

const AddOnPanelsStepContext =
  createContext<AddOnPanelsStepContextValue | null>(null);

export const AddOnPanelsStepProvider = ({ children }: PropsWithChildren) => {
  const { next, prev } = useOnboardingNavigation();
  const {
    selectedServiceIds,
    addService,
    applyToggle,
    clear,
    hasInitializedRecommendedSelections,
    markRecommendedSelectionsInitialized,
  } = useOnboardingCartStore(
    useShallow((s) => ({
      selectedServiceIds: s.selectedServiceIds,
      addService: s.addService,
      applyToggle: s.applyToggle,
      clear: s.clear,
      hasInitializedRecommendedSelections:
        s.hasInitializedRecommendedSelections,
      markRecommendedSelectionsInitialized:
        s.markRecommendedSelectionsInitialized,
    })),
  );
  const { data: addOnsData } = useSuspenseOnboardingAddOns();
  const { activePaymentMethod, isFlexSelected, isSelectingPaymentMethod } =
    usePaymentMethodSelection();
  const createCreditMutation = useCreateCredit();

  const analytics = useAddOnPanelsAnalytics({
    addOnsData,
    selectedServiceIds,
  });

  const preselectEnabled = usePosthogFeatureFlagEnabled(
    FeatureFlags.OnboardingAddOnsEnablePreselect,
  );

  useEffect(() => {
    if (hasInitializedRecommendedSelections) return;
    if (preselectEnabled === undefined) return;

    if (preselectEnabled) {
      for (const group of addOnsData.groups) {
        if (group.selection.type !== 'bundle-or-components') continue;
        const { bundle, components } = group.selection;
        if (bundle == null || bundle.status !== 'available') continue;
        if (components.length === 0) continue;
        if (
          components.every((c) => c.isRecommended && c.status === 'available')
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
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterId, setActiveFilterId] =
    useState<PanelFilterId>(ALL_TESTS_FILTER_ID);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [detailItemId, setDetailItemId] = useState<AddOnItemId | null>(null);

  const toggleCartExpanded = () => {
    setIsCartExpanded((expanded) => !expanded);
  };

  const goToNextRecommendation = () => {
    setRecommendationIndex((index) => index + 1);
  };

  const filterOptions: FilterOption[] = addOnsData.filters.map((f) => ({
    id: f.id,
    label: f.label,
  }));

  const hasPaymentMethodId =
    activePaymentMethod?.externalPaymentMethodId != null;

  const applySelectionToggle = (
    group: AddOnGroup,
    item: AddOnItem,
    source: SelectionChangeSource,
  ) => {
    if (item.status !== 'available') return;
    const isAdding = !selectedServiceIds.has(item.id);
    const intent = computeToggle(group, item, selectedServiceIds);
    applyToggle(intent.select, intent.deselect);
    if (isAdding) {
      analytics.trackItemAdded(item, intent, source);
    } else {
      analytics.trackItemRemoved(item, intent, source);
    }
  };

  const removeItemFromCart = (item: AddOnItem) => {
    const group = findGroupByItemId(addOnsData.groups, item.id);
    if (group == null) return;
    applySelectionToggle(group, item, 'cart');
  };

  const goBack = () => {
    if (recommendationIndex > 0) {
      setRecommendationIndex((index) => index - 1);
      return;
    }

    prev();
  };

  const skip = () => {
    clear();
    next();
  };

  const proceed = async () => {
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

    toast.success('Purchase successful');
    clear();
    next();
  };

  return (
    <AddOnPanelsStepContext.Provider
      value={{
        activeFilterId,
        addOnsData,
        applySelectionToggle,
        closeDetail: () => setDetailItemId(null),
        detailItemId,
        filterOptions,
        goBack,
        goToNextRecommendation,
        hasPaymentMethodId,
        isCartExpanded,
        isFlexSelected,
        isPending: createCreditMutation.isPending,
        isSelectingPaymentMethod,
        openDetail: setDetailItemId,
        proceed,
        recommendationIndex,
        removeItemFromCart,
        searchQuery,
        setActiveFilterId,
        setSearchQuery,
        skip,
        toggleCartExpanded,
      }}
    >
      {children}
    </AddOnPanelsStepContext.Provider>
  );
};

export const useAddOnPanelsStep = () => {
  const value = useContext(AddOnPanelsStepContext);
  if (value == null) {
    throw new Error(
      'useAddOnPanelsStep must be used within AddOnPanelsStepProvider',
    );
  }
  return value;
};
