import { useEffect, useRef } from 'react';

import { env } from '@/config/env';
import { getMessages } from '@/features/messages/api/get-messages';
import type { SourceId } from '@/features/onboarding-circle/const/sources';
import { useReportStore } from '@/features/onboarding-circle/stores/report-store';
import { getActiveLogin } from '@/lib/utils';

const REPORT_PROMPTS: Record<string, string> = {
  wearables:
    'Generate a wearable data insight report. Analyze my sleep, HRV, heart rate, steps, and activity data from my connected wearable. Cross-reference with any other data you have about me — my intake, health goals, symptoms, and any prior labs. Highlight: 1) Key patterns in my wearable data, 2) What these patterns might mean for my upcoming bloodwork, 3) One specific thing I should focus on this week based on the data. Be specific with numbers.',
  labs: 'Generate a lab results insight report. Analyze my uploaded lab results and identify trends across my biomarkers. Cross-reference with everything else you know about me — my wearable data, intake, health goals, and any imported health conversations. Highlight: 1) Biomarkers that are trending in a concerning direction, 2) Connections between my lab results and my daily data (sleep, HRV, activity), 3) What to watch for in my next test. Be specific with numbers and timeframes.',
  'ai-context':
    "Generate a health context insight report based on my imported AI conversations. Map the themes, symptoms, and health concerns I've discussed against all the other data you have — my intake, wearable metrics, and any lab results. Highlight: 1) Recurring health themes and how they connect to my actual data, 2) Concerns I've raised that are supported (or contradicted) by my numbers, 3) Blind spots — things my data suggests I should pay attention to that I haven't mentioned. Be specific.",
};

const FALLBACK_TITLES: Record<string, string> = {
  wearables: 'Your wearable insights',
  labs: 'Your lab insights',
  'ai-context': 'Your health themes',
};

/**
 * Fire a background report generation for a completed source.
 * Creates a new chat thread and sends the report prompt.
 */
export function fireReportGeneration(
  sourceId: SourceId,
  startReport: (sourceId: SourceId, threadId: string) => void,
) {
  const threadId = crypto.randomUUID();
  const prompt = REPORT_PROMPTS[sourceId];
  if (prompt == null) return;

  startReport(sourceId, threadId);

  const accessToken = getActiveLogin()?.accessToken;
  void fetch(`${env.API_URL}/chat/chatv2`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      id: threadId,
      message: {
        id: crypto.randomUUID(),
        role: 'user',
        parts: [{ type: 'text', text: prompt }],
      },
    }),
  }).catch((err) => {
    console.warn('Report generation request failed:', err);
  });
}

/**
 * Polls for report title after generation starts.
 * Checks generating reports every 4 seconds, up to 30 seconds.
 */
export function useReportPolling() {
  const reports = useReportStore((s) => s.reports);
  const markReady = useReportStore((s) => s.markReady);
  const pollingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const [sourceId, report] of Object.entries(reports)) {
      if (report.status !== 'generating') continue;
      if (pollingRef.current.has(sourceId)) continue;

      pollingRef.current.add(sourceId);
      void pollForTitle(
        sourceId as SourceId,
        report.threadId,
        markReady,
      ).finally(() => {
        pollingRef.current.delete(sourceId);
      });
    }
  }, [reports, markReady]);
}

async function pollForTitle(
  sourceId: SourceId,
  threadId: string,
  markReady: (sourceId: SourceId, title: string) => void,
) {
  const maxAttempts = 8;
  const interval = 4000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, interval));

    try {
      const messages = await getMessages({
        chatId: threadId,
        limit: 5,
        sort: 'asc',
        hideToast: true,
      });

      const assistantMessage = messages.find((m) => m.role === 'assistant');
      if (assistantMessage != null && hasSubstantialContent(assistantMessage)) {
        const title = extractTitle(assistantMessage, sourceId);
        markReady(sourceId, title);
        return;
      }
    } catch {
      // Thread might not exist yet, keep polling
    }
  }

  // Timeout — use fallback title
  markReady(sourceId, FALLBACK_TITLES[sourceId] ?? 'Your health insights');
}

function extractTitle(
  message: { parts?: Array<{ type: string; text?: string }> },
  sourceId: string,
): string {
  if (message.parts == null) {
    return FALLBACK_TITLES[sourceId] ?? 'Your health insights';
  }

  for (const part of message.parts) {
    if (part.type === 'text' && part.text != null) {
      const firstLine = part.text.split('\n')[0] ?? '';
      const cleaned = firstLine.replace(/^#+\s*/, '').trim();
      if (cleaned.length > 0 && cleaned.length <= 80) {
        return cleaned;
      }
      if (cleaned.length > 80) {
        return `${cleaned.slice(0, 77)}...`;
      }
    }
  }

  return FALLBACK_TITLES[sourceId] ?? 'Your health insights';
}

function hasSubstantialContent(message: {
  parts?: Array<{ type: string; text?: string }>;
}): boolean {
  if (message.parts == null) return false;
  for (const part of message.parts) {
    if (part.type === 'text' && part.text != null && part.text.length > 100) {
      return true;
    }
  }
  return false;
}
