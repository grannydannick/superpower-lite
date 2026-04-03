import { Link } from '@tanstack/react-router';

import { HomepageCard } from '@/features/homepage/components/homepage-card';

const DAILY_BRIEF_PROMPT =
  'Give me my daily health brief. Look at my latest wearable data, lab results, active protocol, and our recent conversations. Lead with the most actionable insight, connect my daily data to my biomarker trends, and suggest one thing I can do today. Keep it to 2-3 sentences.';

export function DailyBriefTeaser() {
  return (
    <Link
      to="/concierge"
      search={{
        preset: 'daily-brief' as any,
        defaultMessage: DAILY_BRIEF_PROMPT,
      }}
    >
      <HomepageCard>
        <div className="flex items-center gap-3 p-4">
          <div className="from-vermillion-400 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-vermillion-500">
            <span className="text-sm text-white">✦</span>
          </div>
          <p className="font-proreg text-sm leading-snug text-neutral-900">
            Ready for your daily brief? Tap to get a personalized check-in.
          </p>
          <span className="shrink-0 text-neutral-400">›</span>
        </div>
      </HomepageCard>
    </Link>
  );
}
