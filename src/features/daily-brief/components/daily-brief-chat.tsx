import { useChat } from '@ai-sdk/react';
import { useNavigate } from '@tanstack/react-router';
import type { UIMessage } from 'ai';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Body2 } from '@/components/ui/typography';
import { createChatV2Transport } from '@/features/messages/utils/chatv2-transport';

const DAILY_BRIEF_PROMPT =
  "Write a 2-3 sentence daily update for me based on the latest data you have access to, framed as a daily check-in. The message should provide context about my health data — reference specific numbers, biomarker names, wearable metrics, protocol actions, or conversation history. End with a question for me to reply to or pick up the discussion around. Leverage any and all data you have access to for the most contextual, real-time daily message possible. Don't include any headers or formatting — just the message.";

const FULL_BRIEF_PROMPT =
  'Give me my full daily health brief. Look at my latest wearable data, lab results, active protocol, and our recent conversations. Lead with the most actionable insight, connect my daily data to my biomarker trends, and suggest one thing I can do today. Reference specific numbers. End with a question.';

const CHAR_DELAY_MS = 18;

function useTypewriter(text: string | undefined) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const prevTextRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (text == null) return;

    if (prevTextRef.current === text) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    prevTextRef.current = text;

    let i = 0;
    setDisplayed('');
    setDone(false);

    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, CHAR_DELAY_MS);

    return () => clearInterval(interval);
  }, [text]);

  return { displayed, done };
}

/**
 * Invisible component that generates the daily brief via a real chat session.
 * Only mounted once per day — uses a stable daily ID.
 */
function BriefGenerator({
  onBriefReady,
}: {
  onBriefReady: (text: string) => void;
}) {
  const transport = useMemo(() => createChatV2Transport<UIMessage>(), []);
  const autoSentRef = useRef(false);
  const reportedRef = useRef(false);

  // Stable UUID per day — derived from date string
  const chatId = useRef(crypto.randomUUID()).current;

  const { messages, sendMessage, status } = useChat({
    id: chatId,
    transport,
    generateId: () => crypto.randomUUID(),
    onError: (err) => {
      console.error('[DailyBrief] Chat error:', err);
    },
  });

  // Auto-send once ready
  useEffect(() => {
    if (status !== 'ready') return;
    if (autoSentRef.current) return;
    if (messages.length > 0) return;

    autoSentRef.current = true;
    void sendMessage({ text: DAILY_BRIEF_PROMPT, files: [] });
  }, [status, messages.length, sendMessage]);

  // Extract assistant text and report when done
  useEffect(() => {
    if (reportedRef.current) return;

    const assistantMsg = messages.find((m) => m.role === 'assistant');
    if (assistantMsg == null) return;

    let text = '';
    for (const part of assistantMsg.parts) {
      if (part.type === 'text') {
        text = part.text;
        break;
      }
    }

    if (text.length === 0) return;
    if (status !== 'ready') return;

    reportedRef.current = true;
    onBriefReady(text);
  }, [messages, status, onBriefReady]);

  return null;
}

/** Cache key for today's brief in localStorage */
const BRIEF_CACHE_KEY = 'daily-brief-cache';

interface CachedBrief {
  date: string;
  text: string;
}

function getCachedBrief(): string | null {
  try {
    const raw = localStorage.getItem(BRIEF_CACHE_KEY);
    if (raw == null) return null;
    const cached = JSON.parse(raw) as CachedBrief;
    const today = new Date().toISOString().slice(0, 10);
    if (cached.date !== today) return null;
    return cached.text;
  } catch {
    return null;
  }
}

function setCachedBrief(text: string) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(BRIEF_CACHE_KEY, JSON.stringify({ date: today, text }));
}

export function DailyBriefChat() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const [briefText, setBriefText] = useState<string | null>(() =>
    getCachedBrief(),
  );
  const needsGeneration = briefText == null;

  const handleBriefReady = (text: string) => {
    setBriefText(text);
    setCachedBrief(text);
  };

  const { displayed, done } = useTypewriter(briefText ?? undefined);

  const handleBriefClick = () => {
    void navigate({
      to: '/concierge',
      search: { defaultMessage: FULL_BRIEF_PROMPT },
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim().length === 0) return;
    void navigate({
      to: '/concierge',
      search: { defaultMessage: inputValue.trim() },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden generator — only mounts when no cached brief */}
      {needsGeneration && <BriefGenerator onBriefReady={handleBriefReady} />}

      {/* Brief text */}
      <div className="min-h-[60px]">
        {briefText == null ? (
          <div className="space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200/60" />
            <div className="h-3 w-full animate-pulse rounded bg-neutral-200/60" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200/60" />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleBriefClick}
            className="group text-left transition-opacity hover:opacity-80"
          >
            <p className="font-proreg text-sm leading-relaxed text-neutral-700">
              {displayed}
              {!done && (
                <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-neutral-400" />
              )}
            </p>
            {done && (
              <Body2 className="text-vermillion-600 mt-2 transition-colors group-hover:text-vermillion-700">
                Continue in chat →
              </Body2>
            )}
          </button>
        )}
      </div>

      {/* Input */}
      {done && briefText != null && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/80 px-4 py-2.5 shadow-sm duration-500 animate-in fade-in"
        >
          <div className="from-vermillion-400 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-vermillion-500">
            <span className="text-[10px] text-white">✦</span>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={inputValue.trim().length === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white transition-opacity disabled:opacity-30"
          >
            <span className="text-xs">↑</span>
          </button>
        </form>
      )}
    </div>
  );
}
