import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SourceId } from '../const/sources';

interface OnboardingCircleState {
  completedSources: Set<SourceId>;
  inProgressSources: Set<SourceId>;
  presetThreads: Record<string, string>;
  complete: (source: SourceId) => void;
  startSource: (source: SourceId) => void;
  setPresetThread: (sourceId: SourceId, threadId: string) => void;
  reset: () => void;
}

interface OnboardingCirclePersistedState {
  completedSources: string[];
  inProgressSources: string[];
  presetThreads: Record<string, string>;
}

const VALID_SOURCE_IDS = new Set<string>([
  'intake',
  'wearables',
  'ai-context',
  'labs',
]);

export const useOnboardingCircleStore = create<OnboardingCircleState>()(
  persist(
    (set) => ({
      completedSources: new Set<SourceId>(['intake']),
      inProgressSources: new Set<SourceId>(),
      presetThreads: {},
      complete: (source) =>
        set((state) => {
          if (state.completedSources.has(source)) return state;
          const nextCompleted = new Set(state.completedSources);
          nextCompleted.add(source);
          const nextInProgress = new Set(state.inProgressSources);
          nextInProgress.delete(source);
          return {
            completedSources: nextCompleted,
            inProgressSources: nextInProgress,
          };
        }),
      startSource: (source) =>
        set((state) => {
          if (state.inProgressSources.has(source)) return state;
          if (state.completedSources.has(source)) return state;
          const next = new Set(state.inProgressSources);
          next.add(source);
          return { inProgressSources: next };
        }),
      setPresetThread: (sourceId, threadId) =>
        set((state) => ({
          presetThreads: { ...state.presetThreads, [sourceId]: threadId },
        })),
      reset: () =>
        set(() => ({
          completedSources: new Set<SourceId>(['intake']),
          inProgressSources: new Set<SourceId>(),
          presetThreads: {},
        })),
    }),
    {
      name: 'onboarding-circle',
      partialize: (state): OnboardingCirclePersistedState => ({
        completedSources: Array.from(state.completedSources),
        inProgressSources: Array.from(state.inProgressSources),
        presetThreads: state.presetThreads,
      }),
      merge: (persistedState, currentState) => {
        const completedSources: SourceId[] = ['intake'];
        const inProgressSources: SourceId[] = [];
        let presetThreads: Record<string, string> = {};
        if (typeof persistedState === 'object' && persistedState !== null) {
          const p = persistedState as Record<string, unknown>;
          if (Array.isArray(p.completedSources)) {
            for (const id of p.completedSources) {
              if (typeof id === 'string' && VALID_SOURCE_IDS.has(id)) {
                completedSources.push(id as SourceId);
              }
            }
          }
          if (Array.isArray(p.inProgressSources)) {
            for (const id of p.inProgressSources) {
              if (typeof id === 'string' && VALID_SOURCE_IDS.has(id)) {
                inProgressSources.push(id as SourceId);
              }
            }
          }
          if (typeof p.presetThreads === 'object' && p.presetThreads != null) {
            presetThreads = p.presetThreads as Record<string, string>;
          }
        }
        return {
          ...currentState,
          completedSources: new Set(completedSources),
          inProgressSources: new Set(inProgressSources),
          presetThreads,
        };
      },
    },
  ),
);
