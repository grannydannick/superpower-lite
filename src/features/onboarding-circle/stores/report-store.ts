import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SourceId } from '../const/sources';

interface ReportEntry {
  threadId: string;
  status: 'generating' | 'ready';
}

interface ReportStoreState {
  reports: Record<string, ReportEntry>;
  startReport: (sourceId: SourceId, threadId: string) => void;
  completeReport: (sourceId: SourceId) => void;
  getReport: (sourceId: SourceId) => ReportEntry | undefined;
  reset: () => void;
}

interface ReportStorePersistedState {
  reports: Record<string, ReportEntry>;
}

export const useReportStore = create<ReportStoreState>()(
  persist(
    (set, get) => ({
      reports: {},
      startReport: (sourceId, threadId) =>
        set((state) => ({
          reports: {
            ...state.reports,
            [sourceId]: { threadId, status: 'generating' },
          },
        })),
      completeReport: (sourceId) =>
        set((state) => {
          const existing = state.reports[sourceId];
          if (existing == null) return state;
          return {
            reports: {
              ...state.reports,
              [sourceId]: { ...existing, status: 'ready' },
            },
          };
        }),
      getReport: (sourceId) => get().reports[sourceId],
      reset: () => set({ reports: {} }),
    }),
    {
      name: 'onboarding-reports',
      partialize: (state): ReportStorePersistedState => ({
        reports: state.reports,
      }),
    },
  ),
);
