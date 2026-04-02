import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SourceId } from '../const/sources';

interface OnboardingCircleState {
  completedSources: Set<SourceId>;
  complete: (source: SourceId) => void;
  reset: () => void;
}

interface OnboardingCirclePersistedState {
  completedSources: string[];
}

const VALID_SOURCE_IDS = new Set<string>(['intake', 'wearables', 'ai-context', 'labs']);

export const useOnboardingCircleStore = create<OnboardingCircleState>()(
  persist(
    (set) => ({
      completedSources: new Set<SourceId>(['intake']),
      complete: (source) =>
        set((state) => {
          if (state.completedSources.has(source)) return state;
          const next = new Set(state.completedSources);
          next.add(source);
          return { completedSources: next };
        }),
      reset: () => set(() => ({ completedSources: new Set<SourceId>(['intake']) })),
    }),
    {
      name: 'onboarding-circle',
      partialize: (state): OnboardingCirclePersistedState => ({
        completedSources: Array.from(state.completedSources),
      }),
      merge: (persistedState, currentState) => {
        const completedSources: SourceId[] = ['intake'];
        if (
          typeof persistedState === 'object' &&
          persistedState !== null &&
          'completedSources' in persistedState
        ) {
          const maybe = persistedState.completedSources;
          if (Array.isArray(maybe)) {
            for (const id of maybe) {
              if (typeof id === 'string' && VALID_SOURCE_IDS.has(id)) {
                completedSources.push(id as SourceId);
              }
            }
          }
        }
        return { ...currentState, completedSources: new Set(completedSources) };
      },
    },
  ),
);
