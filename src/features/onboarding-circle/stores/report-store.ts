import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Tracks report thread IDs for completed onboarding actions.
 * On first "see report" click, user is sent to concierge with a prompt.
 * Once the thread is created, we store its ID so subsequent clicks
 * go directly to that thread.
 */

interface ReportStoreState {
  /** Map of sourceId → concierge thread ID */
  threadIds: Record<string, string>;
  setThreadId: (sourceId: string, threadId: string) => void;
  getThreadId: (sourceId: string) => string | undefined;
  reset: () => void;
}

export const useReportStore = create<ReportStoreState>()(
  persist(
    (set, get) => ({
      threadIds: {},
      setThreadId: (sourceId, threadId) =>
        set((state) => ({
          threadIds: { ...state.threadIds, [sourceId]: threadId },
        })),
      getThreadId: (sourceId) => get().threadIds[sourceId],
      reset: () => set({ threadIds: {} }),
    }),
    {
      name: 'onboarding-reports',
    },
  ),
);
