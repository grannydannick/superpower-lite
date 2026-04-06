import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useEffect, useMemo, useRef } from 'react';

import { createChatV2Transport } from '@/features/messages/utils/chatv2-transport';

import type { SourceId } from '../const/sources';
import { useReportStore } from '../stores/report-store';

/**
 * Invisible component that runs a background chat session to generate a report.
 * Mount it when a report needs generating — it auto-sends the prompt and
 * updates the report store when the AI finishes.
 */
export function ReportRunner({
  sourceId,
  threadId,
  prompt,
}: {
  sourceId: SourceId;
  threadId: string;
  prompt: string;
}) {
  const transport = useMemo(() => createChatV2Transport<UIMessage>(), []);
  const autoSentRef = useRef(false);
  const completedRef = useRef(false);
  const completeReport = useReportStore((s) => s.completeReport);

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
    void sendMessage({ text: prompt, files: [] });
  }, [status, messages.length, sendMessage, prompt]);

  // Detect completion
  useEffect(() => {
    if (completedRef.current) return;

    const hasAssistantMessage = messages.some((m) => m.role === 'assistant');
    if (!hasAssistantMessage) return;
    if (status !== 'ready') return;

    completedRef.current = true;
    completeReport(sourceId);
  }, [messages, status, sourceId, completeReport]);

  return null;
}
