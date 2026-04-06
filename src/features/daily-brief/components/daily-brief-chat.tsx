import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { Body2 } from '@/components/ui/typography';
import { useLatestHealthScore } from '@/features/data/api';
import { useLatestBioAge } from '@/features/data/api/get-latest-bio-age';
import { useLatestProtocol } from '@/features/protocol/api';
import { useUser } from '@/lib/auth';
import { yearsSinceDate } from '@/utils/format';

const FULL_BRIEF_PROMPT =
  'Give me my full daily health brief. Recall all my data — wearables, labs, protocol, and our recent conversations. Lead with the most actionable insight, reference specific numbers, connect my daily data to my biomarker trends, and suggest one thing I can do today. End with a question.';

function buildBrief({
  score,
  bioAge,
  actualAge,
  hasProtocol,
}: {
  score: number | null;
  bioAge: number | null;
  actualAge: number | null;
  hasProtocol: boolean;
}): string {
  const lines: string[] = [];

  // Line 1: Focus area
  if (hasProtocol) {
    lines.push(
      'Focus: following your active protocol to optimize your health markers.',
    );
  } else if (score != null && score < 70) {
    lines.push(
      'Focus: building your baseline — your health score has room to grow.',
    );
  } else {
    lines.push(
      'Focus: maintaining your strong health foundation and fine-tuning.',
    );
  }

  // Line 2: Data point
  if (score != null && bioAge != null && actualAge != null) {
    const diff = Math.abs(actualAge - bioAge).toFixed(1);
    const younger = bioAge < actualAge;
    lines.push(
      `Your Superpower Score is ${score}/100 and you're aging ${diff} years ${younger ? 'younger' : 'older'} than your actual age.`,
    );
  } else if (score != null) {
    lines.push(
      `Your Superpower Score is ${score}/100 — let's see what's driving it.`,
    );
  } else {
    lines.push(
      'Your health data is building. More insights will appear as we get more data.',
    );
  }

  // Line 3: Question
  if (hasProtocol) {
    lines.push('How has your protocol been going this week?');
  } else if (score != null && score >= 80) {
    lines.push("What's one thing you'd like to optimize further?");
  } else {
    lines.push("What's the one health goal you're most focused on right now?");
  }

  return lines.join(' ');
}

export function DailyBriefChat() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const { data: user } = useUser();
  const { data: scoreData } = useLatestHealthScore();
  const { data: bioAgeData } = useLatestBioAge();
  const { data: protocolData } = useLatestProtocol();

  const score = scoreData?.healthScore?.quantity?.value ?? null;
  const bioAge = bioAgeData?.bioAge?.quantity?.value ?? null;
  const actualAge = user?.dateOfBirth
    ? Math.round(yearsSinceDate(user.dateOfBirth) * 10) / 10
    : null;
  const hasProtocol = protocolData?.protocol != null;

  const briefText = buildBrief({ score, bioAge, actualAge, hasProtocol });

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
      <button
        type="button"
        onClick={handleBriefClick}
        className="group text-left transition-opacity hover:opacity-80"
      >
        <p className="line-clamp-4 font-proreg text-sm leading-relaxed text-neutral-700">
          {briefText}
        </p>
        <Body2 className="text-vermillion-600 mt-2 transition-colors group-hover:text-vermillion-700">
          Get my full daily brief →
        </Body2>
      </button>

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
