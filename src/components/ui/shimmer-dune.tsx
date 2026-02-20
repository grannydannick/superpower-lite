import { cn } from '@/lib/utils';

export const ShimmerDune = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "image-shimmer pointer-events-none h-48 w-full bg-[url('/shimmer.webp')] bg-contain bg-center bg-no-repeat",
        className,
      )}
    ></div>
  );
};
