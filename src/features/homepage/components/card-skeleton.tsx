import { HomepageCard } from './homepage-card';

export const CardSkeleton = () => {
  return (
    <HomepageCard>
      <div className="h-6 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="mt-4 h-4 w-48 animate-pulse rounded bg-zinc-200" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded bg-zinc-200" />
    </HomepageCard>
  );
};
