import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { HomepageCard } from '@/features/homepage/components/homepage-card';
import { createFollowups } from '@/features/messages/api/create-followups';

const DAILY_BRIEF_CONTEXT = `You are generating a single daily health brief for the member — a personalized 2-3 sentence check-in.
Pull from their latest wearable data, lab results, active protocol, and recent conversations.
Lead with the most actionable insight, connect daily data to biomarker trends if available, and end with a conversational hook.
Feel like a coach checking in, not an alarm. Use their first name naturally.
If they have no data yet, warmly encourage them to connect a data source or share their health goals.
Return ONLY the brief text, nothing else.`;

const DAILY_BRIEF_PROMPT =
  'Give me my daily health brief. Look at my latest wearable data, lab results, active protocol, and our recent conversations. Lead with the most actionable insight, connect my daily data to my biomarker trends, and suggest one thing I can do today. Keep it to 2-3 sentences.';

const CHAR_DELAY_MS = 20;

function useDailyBrief() {
  return useQuery({
    queryKey: ['daily-brief'],
    queryFn: ({ signal }) =>
      createFollowups({
        data: { context: DAILY_BRIEF_CONTEXT, count: 1 },
        signal,
      }),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

function useTypewriter(text: string | undefined) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const hasTypedRef = useRef(false);

  useEffect(() => {
    if (text == null) return;

    // If we've already typed this text, show it immediately
    if (hasTypedRef.current) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    hasTypedRef.current = true;
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

export function DailyBriefTeaser() {
  const { data, isLoading } = useDailyBrief();
  const brief = data?.[0];
  const { displayed, done } = useTypewriter(brief);

  if (isLoading) {
    return (
      <HomepageCard>
        <div className="flex items-center gap-3 p-4">
          <div className="from-vermillion-400 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-vermillion-500">
            <span className="animate-pulse text-sm text-white">✦</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      </HomepageCard>
    );
  }

  if (brief == null) {
    return null;
  }

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
            {displayed}
            {!done && (
              <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-neutral-400" />
            )}
          </p>
          {done && <span className="shrink-0 text-neutral-400">›</span>}
        </div>
      </HomepageCard>
    </Link>
  );
}
