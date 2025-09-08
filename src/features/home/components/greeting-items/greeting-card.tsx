import { ComponentProps, forwardRef } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const GreetingCard = forwardRef<
  HTMLDivElement,
  {
    isLoading: boolean;
    children: React.ReactNode;
    className?: string;
  } & ComponentProps<'div'>
>(({ isLoading, children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'group text-white flex h-56 w-full flex-col transition-all duration-300 justify-between outline-transparent focus:outline-1 focus:outline-white/20 overflow-hidden rounded-2xl border border-white/10 bg-zinc-400/15 p-4 backdrop-blur-xl hover:border-white/20 hover:bg-zinc-400/20 ',
        isLoading ? 'cursor-progress' : null,
        className,
      )}
      {...props}
      role="presentation"
    >
      {isLoading ? (
        <div className="flex size-full flex-col justify-between opacity-30">
          <div className="flex w-full items-center justify-between gap-4">
            <Skeleton className="h-8 w-40 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-40 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
});

GreetingCard.displayName = 'GreetingCard';
