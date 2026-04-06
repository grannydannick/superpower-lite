import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { Body2 } from '@/components/ui/typography';
import { useCreateFollowups } from '@/features/messages/api/create-followups';

const BRIEF_CONTEXT = `You are generating a personalized daily health insight for a Superpower member on their homepage dashboard.

IMPORTANT: Reference their ACTUAL data. Look at their real biomarker results, wearable metrics, protocol actions, intake responses, and conversation history. Be specific — mention real numbers, real biomarker names, real trends.

Format: Write a 1-2 sentence data insight, then end with a direct question for the member to answer. The question should be something that helps you understand their experience or progress better.

Examples of good output:
"Your HRV has dropped 12% this week while your resting heart rate climbed to 68 bpm. Are you feeling more stressed than usual, or has your sleep been off?"
"Your fasting glucose has been creeping up over your last 3 tests (94 → 98 → 103). Have you been able to stick to the post-dinner walks from your protocol?"
"Based on your intake, stress management is your top priority, and your cortisol came back elevated at 22.4. What does a typical stressful day look like for you right now?"

If the member has limited data, reference what you do have:
"You mentioned low energy and brain fog in your intake. Before your labs come back, are mornings or afternoons worse for you?"

Return ONLY the insight + question as a single string. No formatting, no headers, no bullet points.`;

const DAILY_BRIEF_PROMPT =
  'Give me my daily health brief. Look at my latest wearable data, lab results, active protocol, and our recent conversations. Lead with the most actionable insight, connect my daily data to my biomarker trends, and suggest one thing I can do today. Keep it to 2-3 sentences.';

const SUGGESTION_CONTEXT =
  'Based on the member\'s actual health data (biomarkers, wearables, protocol, intake), generate 4 specific follow-up questions they might want to explore. Reference real data points where possible. Keep each under 10 words. Examples: "Why is my HRV trending down?", "How does sleep affect my glucose?", "What should I eat before labs?"';

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

  // Use followups endpoint for the brief text — reliable, no chat session issues
  const { data: briefData, isLoading } = useCreateFollowups({
    context: BRIEF_CONTEXT,
    count: 1,
    enabled: true,
  });
  const briefText = briefData?.[0];

  // Suggestion chips
  const { data: suggestions = [] } = useCreateFollowups({
    context: SUGGESTION_CONTEXT,
    count: 4,
    enabled: briefText != null,
  });

  const { displayed, done } = useTypewriter(briefText);

  const handleSuggestionClick = (suggestion: string) => {
    void navigate({
      to: '/concierge',
      search: { defaultMessage: suggestion },
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

  const handleBriefClick = () => {
    void navigate({
      to: '/concierge',
      search: { defaultMessage: DAILY_BRIEF_PROMPT },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Brief text */}
      <div className="min-h-[48px]">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200/60" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200/60" />
          </div>
        ) : displayed.length > 0 ? (
          <button
            type="button"
            onClick={handleBriefClick}
            className="text-left transition-opacity hover:opacity-80"
          >
            <p className="font-proreg text-sm leading-relaxed text-neutral-700">
              {displayed}
              {!done && (
                <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-neutral-400" />
              )}
            </p>
          </button>
        ) : null}
      </div>

      {/* Suggestion chips */}
      {done && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestionClick(s)}
              className="rounded-2xl border border-zinc-200 bg-white/80 px-3 py-1.5 text-left text-xs shadow-sm transition-all hover:bg-zinc-100"
            >
              <Body2 className="text-secondary">{s}</Body2>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      {done && (
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
