import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ParsedReport } from '@/features/reports/types';

import type { SourceId } from '../const/sources';

interface ReportEntry {
  threadId: string;
  status: 'generating' | 'ready';
  title: string | null;
  parsedReport: ParsedReport | null;
}

interface ReportStoreState {
  reports: Record<string, ReportEntry>;
  startReport: (sourceId: SourceId, threadId: string) => void;
  markReady: (sourceId: SourceId, title: string) => void;
  setReport: (
    sourceId: SourceId,
    title: string,
    parsedReport: ParsedReport,
  ) => void;
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
            [sourceId]: {
              threadId,
              status: 'generating',
              title: null,
              parsedReport: null,
            },
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
      setReport: (sourceId, title, parsedReport) =>
        set((state) => {
          const existing = state.reports[sourceId];
          if (existing == null) return state;
          return {
            reports: {
              ...state.reports,
              [sourceId]: { ...existing, status: 'ready', title, parsedReport },
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
