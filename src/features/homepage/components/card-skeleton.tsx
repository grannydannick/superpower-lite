export const CardSkeleton = () => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="h-6 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="mt-4 h-4 w-48 animate-pulse rounded bg-zinc-200" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded bg-zinc-200" />
    </div>
  );
};
