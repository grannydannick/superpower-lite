import { useEffect, useRef } from 'react';

import { getMessages } from '@/features/messages/api/get-messages';
import { useOnboardingCircleStore } from '@/features/onboarding-circle/stores/onboarding-circle-store';
import { useReportStore } from '@/features/onboarding-circle/stores/report-store';
import { useWearables } from '@/features/settings/api/get-wearables';

import { fireReportGeneration } from './use-report-polling';

/**
 * Auto-detects when a data source task is completed.
 *
 * - Wearables: checks useWearables() for connected devices
 * - Labs / AI context: checks if the concierge preset thread has an assistant response
 *
 * When a source transitions from in-progress to complete, fires report generation.
 */
export function useSourceCompletion() {
  const completedSources = useOnboardingCircleStore((s) => s.completedSources);
  const inProgressSources = useOnboardingCircleStore(
    (s) => s.inProgressSources,
  );
  const presetThreads = useOnboardingCircleStore((s) => s.presetThreads);
  const complete = useOnboardingCircleStore((s) => s.complete);
  const reports = useReportStore((s) => s.reports);
  const startReport = useReportStore((s) => s.startReport);
  const { data: wearablesData } = useWearables();

  const detectingRef = useRef(false);

  useEffect(() => {
    if (detectingRef.current) return;

    const detect = async () => {
      detectingRef.current = true;

      try {
        // Check wearables
        if (
          inProgressSources.has('wearables') &&
          !completedSources.has('wearables') &&
          reports['wearables'] == null
        ) {
          const connected =
            wearablesData?.wearables?.filter((w) => w.status === 'connected') ??
            [];
          if (connected.length > 0) {
            complete('wearables');
            fireReportGeneration('wearables', startReport);
          }
        }

        // Check labs
        if (
          inProgressSources.has('labs') &&
          !completedSources.has('labs') &&
          reports['labs'] == null
        ) {
          const threadId = presetThreads['labs'];
          if (threadId != null) {
            const hasResponse = await checkThreadHasAssistantResponse(threadId);
            if (hasResponse) {
              complete('labs');
              fireReportGeneration('labs', startReport);
            }
          }
        }

        // Check ai-context
        if (
          inProgressSources.has('ai-context') &&
          !completedSources.has('ai-context') &&
          reports['ai-context'] == null
        ) {
          const threadId = presetThreads['ai-context'];
          if (threadId != null) {
            const hasResponse = await checkThreadHasAssistantResponse(threadId);
            if (hasResponse) {
              complete('ai-context');
              fireReportGeneration('ai-context', startReport);
            }
          }
        }
      } finally {
        detectingRef.current = false;
      }
    };

    void detect();
  }, [
    completedSources,
    inProgressSources,
    presetThreads,
    wearablesData,
    complete,
    startReport,
    reports,
  ]);
}

async function checkThreadHasAssistantResponse(
  threadId: string,
): Promise<boolean> {
  try {
    const messages = await getMessages({
      chatId: threadId,
      limit: 5,
      sort: 'desc',
      hideToast: true,
    });
    return messages.some((m) => m.role === 'assistant');
  } catch {
    return false;
  }
}
