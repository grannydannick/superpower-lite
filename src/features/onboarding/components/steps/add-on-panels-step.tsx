import { useShallow } from 'zustand/react/shallow';

import { AddOnPanelsStep } from '@/features/add-on-panels/add-on-panels-step';
import { ADD_ON_PANELS_STEP_VARIANTS } from '@/features/add-on-panels/add-on-panels-variants';
import { useOnboardingCartStore } from '@/features/add-on-panels/stores/add-on-panels-cart-store';

import { useOnboardingNavigation } from '../../hooks/use-onboarding-navigation';

const OnboardingAddOnPanelsStep = () => {
  const { next, prev } = useOnboardingNavigation();
  const cart = useOnboardingCartStore(
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

  return (
    <AddOnPanelsStep
      navigation={{ next, prev }}
      cart={cart}
      variant={ADD_ON_PANELS_STEP_VARIANTS.onboarding}
    />
  );
};

export default OnboardingAddOnPanelsStep;
