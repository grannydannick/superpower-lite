import { IconArrowUpRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUpRight';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ArrowUpIcon } from 'lucide-react';
import { Suspense, lazy, useMemo, useState } from 'react';

import { AIIcon } from '@/components/icons/ai-icon';
import { Link } from '@/components/ui/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  categoriesQuery,
  homepageFollowupsQuery,
} from '@/features/homepage/api/queries';
import { useUser } from '@/lib/auth';

const DigitalTwin = lazy(() =>
  import('@/features/digital-twin/components/digital-twin').then((mod) => ({
    default: mod.DigitalTwin,
  })),
);

export const DigitalTwinCard = () => {
  const { data: user } = useUser();
  const { data: categoriesData } = useQuery(categoriesQuery());
  const filterCategories = useMemo(() => {
    const categories: string[] = [];
    const availableCategories = categoriesData?.categories ?? [];
    for (const category of availableCategories) {
      categories.push(category.category);
    }
    return categories;
  }, [categoriesData?.categories]);

  return (
    <div className="relative h-full">
      <div className="relative h-[calc(100vh-160px)] max-h-[1000px] overflow-hidden rounded-3xl bg-zinc-100">
        <div className="absolute left-6 top-6 z-10">
          {user ? (
            <h2 className="text-4xl font-normal tracking-tight text-zinc-900">
              Welcome {user?.firstName}
            </h2>
          ) : (
            <h2 className="text-3xl font-medium text-zinc-900">
              Unlock after
              <br />
              your first baseline test
            </h2>
          )}
        </div>

        <Link
          to="/data"
          className="absolute right-6 top-6 z-10 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-200"
          aria-label="Expand digital twin"
        >
          <IconArrowUpRight className="size-6" strokeWidth={1.5} />
        </Link>

        <HomepageChatBar />

        <Suspense fallback={null}>
          <DigitalTwin filterCategories={filterCategories} />
        </Suspense>
      </div>
    </div>
  );
};

const PROMPT_COUNT = 3;

function HomepageChatBar() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const { data: prompts, isLoading } = useQuery(homepageFollowupsQuery());

  const goToConcierge = (message: string) => {
    void navigate({
      to: '/concierge',
      search: { defaultMessage: message, autoSend: true },
    });
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    goToConcierge(trimmed);
  };

  const visiblePrompts = prompts?.slice(0, PROMPT_COUNT) ?? [];

  return (
    <div className="absolute inset-x-4 bottom-4 z-10 flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-1.5">
        {isLoading || visiblePrompts.length === 0
          ? Array.from({ length: PROMPT_COUNT }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[38px] min-w-[140px] flex-1 rounded-xl border border-zinc-200/60 bg-white/70 shadow-lg shadow-black/5 backdrop-blur-sm"
              />
            ))
          : visiblePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => goToConcierge(prompt)}
                className="min-w-[140px] flex-1 rounded-xl border border-zinc-200/60 bg-white/70 px-3 py-2.5 text-xs font-medium text-zinc-500 shadow-lg shadow-black/5 backdrop-blur-sm transition-all hover:bg-white hover:text-zinc-700"
              >
                {prompt}
              </button>
            ))}
      </div>
      <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-200/60 bg-white/80 px-4 py-3.5 shadow-lg shadow-black/5 backdrop-blur-sm transition-colors focus-within:border-zinc-300 focus-within:bg-white">
        <AIIcon size={24} className="shrink-0 opacity-60" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask anything..."
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!value.trim()}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors disabled:bg-zinc-300"
        >
          <ArrowUpIcon size={14} />
        </button>
      </div>
    </div>
  );
}
