import { useEffect, useRef } from 'react';

import { env } from '@/config/env';
import { getMessages } from '@/features/messages/api/get-messages';
import type { SourceId } from '@/features/onboarding-circle/const/sources';
import { useReportStore } from '@/features/onboarding-circle/stores/report-store';
import type { ParsedReport } from '@/features/reports/types';
import { getActiveLogin } from '@/lib/utils';

const JSON_INSTRUCTION = `

IMPORTANT: Respond ONLY with a valid JSON object (no markdown, no code fences, no extra text). Use this exact structure:
{
  "title": "short report title",
  "source": "wearables|labs|ai-context",
  "metrics": [
    {
      "value": <number>,
      "unit": "<string>",
      "label": "<what this measures>",
      "identity": "<identity-framed headline, e.g. 'You're a fast recoverer'>",
      "status": "healthy|good|alert|neutral",
      "tag": "<one word: Strong, Healthy, Declining, etc.>",
      "direction": "up|down" // optional, only for change metrics
    }
  ],
  "connections": [
    {
      "metricIndex": <index into metrics array>,
      "sources": ["wearables", "intake"],
      "headline": "<emotionally resonant one-liner connecting data points>",
      "body": "<2-3 sentences explaining the connection with specific numbers>",
      "callout": { "label": "<short label>", "text": "<actionable detail>" }
    }
  ],
  "correlation": {
    "from": { "emoji": "<emoji>", "label": "<short label>" },
    "to": { "emoji": "<emoji>", "label": "<short label>" },
    "identity": "<identity-framed headline>",
    "body": "<one sentence with specific numbers>",
    "connection": {
      "sources": ["wearables", "intake"],
      "headline": "<connecting to member goals>",
      "body": "<2-3 sentences>",
      "callout": { "label": "<label>", "text": "<detail>" }
    }
  },
  "nextSteps": [
    { "emoji": "<emoji>", "title": "<short title>", "detail": "<one sentence>" }
  ],
  "ctaQuestions": ["<question 1>", "<question 2>", "<question 3>"],
  "summary": "<2 sentences summarizing the report>"
}`;

const REPORT_PROMPTS: Record<string, string> = {
  wearables: `You are a health data analyst for Superpower. Analyze the member's wearable data (sleep, HRV, heart rate, steps, activity) from their connected wearable. Cross-reference with ALL other data you have — intake (symptoms, goals, history), any imported AI conversations, and any uploaded labs. Generate 3-4 key metrics with identity-framed insights, find cross-source connections that tell a story, and identify one correlation pattern. Frame findings as identity statements (e.g., "You're a fast recoverer" not "Your recovery is good"). Be specific with numbers.${JSON_INSTRUCTION}`,
  labs: `You are a health data analyst for Superpower. Analyze the member's uploaded lab results and identify biomarker trends. Cross-reference with ALL other data — wearable metrics, intake (symptoms, goals), and imported AI conversations. Generate 3-4 key metrics with identity-framed insights, find cross-source connections, and identify one correlation pattern. Frame findings as identity statements. Be specific with numbers and timeframes.${JSON_INSTRUCTION}`,
  'ai-context': `You are a health data analyst for Superpower. Analyze the member's imported AI health conversations. Map themes, symptoms, and concerns against ALL other data — intake, wearable metrics, and lab results. Generate 3-4 key metrics/themes with identity-framed insights, find cross-source connections, and identify one correlation pattern. Frame findings as identity statements. Be specific.${JSON_INSTRUCTION}`,
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
  const maxAttempts = 10;
  const interval = 5000;

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
        const parsed = tryParseReport(assistantMessage);
        if (parsed != null) {
          useReportStore.getState().setReport(sourceId, parsed.title, parsed);
          return;
        }
        // Fallback: not valid JSON, use first line as title
        const title = extractTitle(assistantMessage, sourceId);
        markReady(sourceId, title);
        return;
      }
    } catch {
      // Thread might not exist yet, keep polling
    }
  }

  markReady(sourceId, FALLBACK_TITLES[sourceId] ?? 'Your health insights');
}

function tryParseReport(message: {
  parts?: Array<{ type: string; text?: string }>;
}): ParsedReport | null {
  if (message.parts == null) return null;

  for (const part of message.parts) {
    if (part.type !== 'text' || part.text == null) continue;

    let text = part.text.trim();

    // Strip markdown code fences if present
    if (text.startsWith('```')) {
      const firstNewline = text.indexOf('\n');
      const lastFence = text.lastIndexOf('```');
      if (firstNewline !== -1 && lastFence > firstNewline) {
        text = text.slice(firstNewline + 1, lastFence).trim();
      }
    }

    try {
      const parsed = JSON.parse(text);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof parsed.title === 'string' &&
        Array.isArray(parsed.metrics)
      ) {
        return parsed as ParsedReport;
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  return null;
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
