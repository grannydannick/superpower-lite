import { useDailyBrief } from '../api/get-daily-brief';

import { DailyBriefPills } from './daily-brief-pills';

export function DailyBriefCard() {
  const { data: brief, isLoading } = useDailyBrief();

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-neutral-200" />
          <div className="h-3 w-32 rounded bg-neutral-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-neutral-200" />
          <div className="h-3 w-4/5 rounded bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (brief == null) {
    return null;
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="from-vermillion-400 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br to-vermillion-500">
          <span className="text-xs text-white">✦</span>
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
          Daily Brief · {today}
        </span>
      </div>
      <p className="mb-4 font-proreg text-sm leading-relaxed text-neutral-900">
        {brief.brief}
      </p>
      {brief.layers.length > 0 && <DailyBriefPills layers={brief.layers} />}
    </div>
  );
}
