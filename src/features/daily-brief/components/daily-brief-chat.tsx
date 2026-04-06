import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { Body2 } from '@/components/ui/typography';
import { useCreateFollowups } from '@/features/messages/api/create-followups';

const BRIEF_CONTEXT = `Generate a short daily check-in for the member's homepage. Use their real data. THREE lines max, structured exactly like this:

Line 1: Their current focus area (from protocol or goals). Keep to ~10 words.
Line 2: One specific data point or trend you're seeing. Use a real number. No URLs or links. ~15 words max.
Line 3: A short, engaging question for them to reply to. ~10 words.

Example:
"Focus: improving sleep quality for metabolic health. Your HRV rebounded to 76ms last night — up from 22ms two days ago. What time did you get to bed?"

RULES:
- NO URLs, links, FHIR references, or markdown
- NO long paragraphs — three short lines only
- Use plain numbers (e.g. "cortisol 23 mcg/dL") not citation formats
- Be warm and conversational, not clinical`;

const DAILY_BRIEF_PROMPT =
  'Give me my full daily health brief. Recall all my data — wearables, labs, protocol, and our recent conversations. Lead with the most actionable insight, reference specific numbers, connect my daily data to my biomarker trends, and suggest one thing I can do today. End with a question.';

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

export function DailyBriefChat() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const { data: briefData, isLoading } = useCreateFollowups({
    context: BRIEF_CONTEXT,
    count: 1,
    enabled: true,
  });
  const briefText = briefData?.[0];

  const { displayed, done } = useTypewriter(briefText);

  const handleBriefClick = () => {
    void navigate({
      to: '/concierge',
      search: { defaultMessage: DAILY_BRIEF_PROMPT },
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
      {/* Brief text */}
      <div className="min-h-[60px]">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200/60" />
            <div className="h-3 w-full animate-pulse rounded bg-neutral-200/60" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200/60" />
          </div>
        ) : briefText != null ? (
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
        ) : null}
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
