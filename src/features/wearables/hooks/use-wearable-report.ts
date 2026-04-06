import { useChat } from '@ai-sdk/react';
import { useNavigate } from '@tanstack/react-router';
import type { UIMessage } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { toast } from '@/components/ui/sonner';
import { createChatV2Transport } from '@/features/messages/utils/chatv2-transport';

const STORAGE_KEY = 'wearable-report-pending';

function buildReportPrompt(providerName: string) {
  return `I just connected ${providerName}. Generate an insight report analyzing my wearable data and cross-referencing it with EVERYTHING else you know about me — my health intake, symptoms, goals, any prior labs, and any imported health conversations.

This report should be compounding — don't just analyze the wearable data in isolation. Connect the dots:

1. **Key wearable findings** — What does my sleep, HRV, heart rate, steps, and activity data show? Be specific with numbers and trends.
2. **Cross-references** — How do these patterns connect to my intake data (symptoms, conditions, goals), my lab results (if any), and my health conversations (if imported)? What corroborates what?
3. **What to watch for** — Based on the combined picture, what should my upcoming bloodwork or protocol likely target?
4. **One thing to do this week** — A specific, actionable recommendation grounded in the data.

Be specific with numbers, timeframes, and data points. Don't be generic — reference MY actual data.`;
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
