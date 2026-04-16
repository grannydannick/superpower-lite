import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AddOnItemId } from '../api/onboarding-add-ons';

interface OnboardingCartStoreState {
  selectedServiceIds: Set<AddOnItemId>;
  hasInitializedRecommendedSelections: boolean;
  toggleService: (serviceId: AddOnItemId) => void;
  applyToggle: (select: AddOnItemId[], deselect: AddOnItemId[]) => void;
  addService: (serviceId: AddOnItemId) => void;
  markRecommendedSelectionsInitialized: () => void;
  clear: () => void;
}

interface OnboardingCartPersistedState {
  selectedPanelIds?: AddOnItemId[];
  selectedServiceIds?: AddOnItemId[];
  hasInitializedRecommendedSelections?: boolean;
}

export const useOnboardingCartStore = create<OnboardingCartStoreState>()(
  persist(
    (set) => ({
      selectedServiceIds: new Set<AddOnItemId>(),
      hasInitializedRecommendedSelections: false,
      toggleService: (serviceId) =>
        set((state) => {
          const nextIds = new Set(state.selectedServiceIds);
          if (nextIds.has(serviceId)) {
            nextIds.delete(serviceId);
          } else {
            nextIds.add(serviceId);
          }
          return { selectedServiceIds: nextIds };
        }),
      applyToggle: (select, deselect) =>
        set((state) => {
          const nextIds = new Set(state.selectedServiceIds);
          for (const id of deselect) nextIds.delete(id);
          for (const id of select) nextIds.add(id);
          return { selectedServiceIds: nextIds };
        }),
      addService: (serviceId) =>
        set((state) => {
          if (state.selectedServiceIds.has(serviceId)) {
            return state;
          }
          const nextIds = new Set(state.selectedServiceIds);
          nextIds.add(serviceId);
          return { selectedServiceIds: nextIds };
        }),
      markRecommendedSelectionsInitialized: () =>
        set((state) => {
          if (state.hasInitializedRecommendedSelections) {
            return state;
          }

          return { hasInitializedRecommendedSelections: true };
        }),
      clear: () => set(() => ({ selectedServiceIds: new Set<AddOnItemId>() })),
    }),
    {
      name: 'onboarding-cart-store',
      partialize: (state): OnboardingCartPersistedState => ({
        hasInitializedRecommendedSelections:
          state.hasInitializedRecommendedSelections,
        selectedServiceIds: Array.from(state.selectedServiceIds),
      }),
      merge: (persistedState, currentState) => {
        const selectedServiceIds: AddOnItemId[] = [];
        let hasInitializedRecommendedSelections = false;

        if (typeof persistedState === 'object' && persistedState !== null) {
          if (
            'hasInitializedRecommendedSelections' in persistedState &&
            persistedState.hasInitializedRecommendedSelections === true
          ) {
            hasInitializedRecommendedSelections = true;
          }

          if ('selectedServiceIds' in persistedState) {
            const maybeSelectedServiceIds = persistedState.selectedServiceIds;

            if (Array.isArray(maybeSelectedServiceIds)) {
              for (const serviceId of maybeSelectedServiceIds) {
                if (typeof serviceId === 'string') {
                  selectedServiceIds.push(serviceId);
                }
              }
            }
          } else if ('selectedPanelIds' in persistedState) {
            const maybeSelectedPanelIds = persistedState.selectedPanelIds;

            if (Array.isArray(maybeSelectedPanelIds)) {
              for (const panelId of maybeSelectedPanelIds) {
                if (typeof panelId === 'string') {
                  selectedServiceIds.push(panelId);
                }
              }
            }
          }
        }

        return {
          ...currentState,
          hasInitializedRecommendedSelections,
          selectedServiceIds: new Set<AddOnItemId>(selectedServiceIds),
        };
      },
    },
  ),
);
