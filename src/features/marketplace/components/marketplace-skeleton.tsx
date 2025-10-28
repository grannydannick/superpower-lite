import { Skeleton } from '@/components/ui/skeleton';

export const MarketplaceSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 *:h-[40px] *:rounded-[10px]">
        <Skeleton className="w-44 md:w-64" />
        <Skeleton className="w-56 md:w-80" />
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4">
        {Array(9)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              className="aspect-square w-full rounded-[20px] md:aspect-[456/501] md:h-full"
              key={i}
            />
          ))}
      </div>
    </div>
  );
};
