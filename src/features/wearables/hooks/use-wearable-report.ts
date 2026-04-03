import { useChat } from '@ai-sdk/react';
import { useNavigate } from '@tanstack/react-router';
import type { UIMessage } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { toast } from '@/components/ui/sonner';
import { createChatV2Transport } from '@/features/messages/utils/chatv2-transport';

const STORAGE_KEY = 'wearable-report-pending';

function buildReportPrompt(providerName: string) {
  return `Generate a comprehensive wearables insight report for me. I just connected ${providerName}.

Analyze my wearable data and connect the dots between:
- My wearable metrics (sleep, HRV, heart rate, steps, activity)
- My lab results and biomarker trends
- My health history and intake goals
- My active protocol recommendations

Structure the report as:
1. Key findings from the wearable data
2. Connections between my wearable data and my labs/biomarkers
3. Actionable insights — what should I focus on based on the combined picture
4. One specific recommendation for this week

Be specific with numbers and data points. This is a detailed report, not a brief.`;
}

interface PendingReport {
  threadId: string;
  providerName: string;
  completedAt: string;
}

function getPendingReport(): PendingReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    return JSON.parse(raw) as PendingReport;
  } catch {
    return null;
  }
}

function setPendingReport(report: PendingReport) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
}

export function clearPendingReport() {
  localStorage.removeItem(STORAGE_KEY);
}

export { getPendingReport };

/**
 * Inner component that actually runs the chat session.
 * Only rendered when providerName is set — this ensures useChat
 * initializes with a real thread ID.
 */
export function WearableReportRunner({
  providerName,
  threadId,
  onComplete,
}: {
  providerName: string;
  threadId: string;
  onComplete: () => void;
}) {
  const navigate = useNavigate();
  const transport = useMemo(() => createChatV2Transport<UIMessage>(), []);
  const autoSentRef = useRef(false);
  const toastFiredRef = useRef(false);

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    transport,
    generateId: () => crypto.randomUUID(),
  });

  // Auto-send prompt once chat is ready
  useEffect(() => {
    if (status !== 'ready') return;
    if (autoSentRef.current) return;
    if (messages.length > 0) return;

    autoSentRef.current = true;
    void sendMessage({
      text: buildReportPrompt(providerName),
      files: [],
    });
  }, [status, messages.length, sendMessage, providerName]);

  // Detect completion and fire toast
  useEffect(() => {
    if (toastFiredRef.current) return;

    const hasAssistantMessage = messages.some((m) => m.role === 'assistant');
    if (!hasAssistantMessage) return;
    if (status !== 'ready') return;

    toastFiredRef.current = true;

    setPendingReport({
      threadId,
      providerName,
      completedAt: new Date().toISOString(),
    });

    toast.success(`Your ${providerName} insights report is ready`, {
      action: {
        label: 'View report →',
        onClick: () => {
          clearPendingReport();
          void navigate({ to: `/concierge/${threadId}` });
        },
      },
      duration: 10000,
    });

    onComplete();
  }, [messages, status, threadId, providerName, navigate, onComplete]);

  return null;
}

export function useWearableReport() {
  const [activeReport, setActiveReport] = useState<{
    providerName: string;
    threadId: string;
  } | null>(null);

  const generate = useCallback((provider: string) => {
    setActiveReport({
      providerName: provider,
      threadId: `wearable-report-${provider}-${Date.now()}`,
    });
  }, []);

  const handleComplete = useCallback(() => {
    setActiveReport(null);
  }, []);

  return { generate, activeReport, handleComplete };
}
