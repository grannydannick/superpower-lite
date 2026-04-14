import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SourceId } from '../const/sources';

interface ReportEntry {
  threadId: string;
  status: 'generating' | 'ready';
  title: string | null;
}

interface ReportStoreState {
  reports: Record<string, ReportEntry>;
  startReport: (sourceId: SourceId, threadId: string) => void;
  markReady: (sourceId: SourceId, title: string) => void;
  getReport: (sourceId: SourceId) => ReportEntry | undefined;
  reset: () => void;
}

export type { ReportEntry };

export const useReportStore = create<ReportStoreState>()(
  persist(
    (set, get) => ({
      reports: {},
      startReport: (sourceId, threadId) =>
        set((state) => ({
          reports: {
            ...state.reports,
            [sourceId]: { threadId, status: 'generating', title: null },
          },
        })),
      markReady: (sourceId, title) =>
        set((state) => {
          const existing = state.reports[sourceId];
          if (existing == null) return state;
          return {
            reports: {
              ...state.reports,
              [sourceId]: { ...existing, status: 'ready', title },
            },
          };
        }),
      getReport: (sourceId) => get().reports[sourceId],
      reset: () => set({ reports: {} }),
    }),
    {
      name: 'onboarding-reports',
    },
  ),
);
