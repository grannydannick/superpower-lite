import { Link } from '@tanstack/react-router';

import { HomepageCard } from '@/features/homepage/components/homepage-card';

import { useDailyBrief } from '../api/get-daily-brief';

export function DailyBriefTeaser() {
  const { data: brief, isLoading } = useDailyBrief();

  if (isLoading) {
    return (
      <HomepageCard>
        <div className="flex animate-pulse items-center gap-3 p-4">
          <div className="h-9 w-9 rounded-full bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-neutral-200" />
            <div className="h-3 w-1/2 rounded bg-neutral-200" />
          </div>
        </div>
      </HomepageCard>
    );
  }

  if (brief == null) {
    return null;
  }

  return (
    <Link to="/concierge" search={{ preset: 'daily-brief' as any }}>
      <HomepageCard>
        <div className="flex items-center gap-3 p-4">
          <div className="from-vermillion-400 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-vermillion-500">
            <span className="text-sm text-white">✦</span>
          </div>
          <p className="font-proreg text-sm leading-snug text-neutral-900">
            {brief.brief}
          </p>
          <span className="shrink-0 text-neutral-400">›</span>
        </div>
      </HomepageCard>
    </Link>
  );
}
