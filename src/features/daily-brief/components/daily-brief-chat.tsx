import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { Body2 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';

const DAILY_BRIEF_PROMPT =
  'Give me my daily health brief. Look at my latest wearable data, lab results, active protocol, and our recent conversations. Lead with the most actionable insight — reference specific numbers and biomarker names. Connect my daily data to my biomarker trends, and suggest one thing I can do today. Keep it to 2-3 sentences. End with a question for me.';

/** Rotating teaser messages — one per day based on date */
const TEASERS = [
  "Let's check in on your health data. I'll pull your latest wearables, labs, and protocol to give you today's insight.",
  "Ready for today's brief? I'll connect the dots between your sleep, biomarkers, and goals.",
  "Your daily health check-in is ready. I'll look at what changed overnight and what to focus on today.",
  "Time for your daily brief — I'll analyze your latest data and give you one thing to focus on.",
  'Your health data has been updating. Want to see what stands out today and how it connects to your labs?',
  "Let's see how yesterday went. I'll check your wearables against your protocol goals.",
  "Your daily insight is ready — I'll look at your trends and flag anything that needs attention.",
];

function getTodayTeaser() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return TEASERS[dayOfYear % TEASERS.length];
}

export function DailyBriefChat() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const { data: user } = useUser();
  const firstName = user?.firstName ?? 'there';
  const teaser = getTodayTeaser();

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
      {/* Teaser — tapping opens concierge with full brief prompt */}
      <button
        type="button"
        onClick={handleBriefClick}
        className="group text-left transition-opacity hover:opacity-80"
      >
        <p className="font-proreg text-sm leading-relaxed text-neutral-700">
          Hey {firstName} — {teaser.toLowerCase()}
        </p>
        <Body2 className="text-vermillion-600 mt-1 transition-colors group-hover:text-vermillion-700">
          Get my daily brief →
        </Body2>
      </button>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/80 px-4 py-2.5 shadow-sm"
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
    </div>
  );
}
