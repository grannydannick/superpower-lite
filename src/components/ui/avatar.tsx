import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Skeleton } from './skeleton';

const variants = cva(
  'aspect-square cursor-pointer overflow-hidden rounded-full outline outline-1 -outline-offset-1 outline-black/10',
  {
    variants: {
      size: {
        small: 'size-8',
        medium: 'size-10',
        large: 'size-12',
      },
    },
  },
);

export const Avatar = React.forwardRef<
  HTMLDivElement,
  {
    src?: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
    isLoading?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ src, size = 'medium', className, isLoading = false, ...props }, ref) => {
  const imagePath = src || '/user/fallback-avatar.webp';

  return (
    <div ref={ref} className={cn(variants({ size }), className)} {...props}>
      {isLoading ? (
        <Skeleton className="size-full" />
      ) : (
        <img src={imagePath} alt="avatar" className="size-full object-cover" />
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';
