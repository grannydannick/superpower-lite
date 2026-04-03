import { IconArrowUpRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUpRight';
import { Suspense, lazy, useEffect, useState } from 'react';

import { Link } from '@/components/ui/link';
import { DailyBriefChat } from '@/features/daily-brief/components/daily-brief-chat';
import { useUser } from '@/lib/auth';

const LG_BREAKPOINT = 1024;

const DigitalTwin = lazy(() =>
  import('@/features/digital-twin/components/digital-twin').then((mod) => ({
    default: mod.DigitalTwin,
  })),
);

export const DigitalTwinCard = () => {
  const [isLgUp, setIsLgUp] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= LG_BREAKPOINT;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    const onChange = () => {
      setIsLgUp(mql.matches);
    };
    mql.addEventListener('change', onChange);
    onChange();
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const { data: user } = useUser();

  return (
    <div className="relative top-0 hidden h-full lg:block">
      <div className="sticky top-[120px] flex max-h-[1000px] rounded-3xl bg-zinc-100 lg:items-center lg:justify-end">
        <div className="absolute left-6 top-6 z-10">
          <h2 className="text-3xl font-medium text-zinc-800">
            Welcome {user?.firstName ?? 'back'}!
          </h2>
        </div>

        {/* Top right overlay: Expand icon */}
        <Link
          to="/data"
          className="absolute right-6 top-6 z-10 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-200"
          aria-label="Expand digital twin"
        >
          <IconArrowUpRight className="size-6" strokeWidth={1.5} />
        </Link>

        {isLgUp ? (
          <Suspense fallback={null}>
            <DigitalTwin />
          </Suspense>
        ) : null}

        {/* Daily brief chat overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 rounded-b-3xl bg-gradient-to-t from-zinc-100 via-zinc-100/95 to-transparent px-6 pb-6 pt-16">
          <DailyBriefChat />
        </div>
      </div>
    </div>
  );
};
