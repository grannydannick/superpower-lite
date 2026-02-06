import { cn } from '@/lib/utils';

export const ShimmerDune = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "image-shimmer pointer-events-none w-full h-48 bg-[url('/shimmer.webp')] bg-contain bg-center bg-no-repeat",
        className,
      )}
    ></div>
  );
};
