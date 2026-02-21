import { m } from 'framer-motion';
import type React from 'react';

import { cn } from '@/lib/utils';

type ShimmerDividerProps = {
  className?: string;
  duration?: number;
  intensity?: number;
  direction?: 'up' | 'down';
};

/**
 * A 1px vertical divider with a subtle shimmer highlight traveling along it.
 * Designed for dark backgrounds; tweak `intensity` for brightness.
 */
export function ShimmerDivider({
  className,
  duration = 2.2,
  intensity = 0.7,
  direction = 'up',
}: ShimmerDividerProps) {
  const highlightAlpha = Math.max(0, Math.min(1, intensity));

  return (
    <div
      aria-hidden
      className={cn('relative w-px overflow-hidden bg-white/25', className)}
      style={{
        // Soft edge mask to avoid any perceivable cutoff at ends
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}
    >
      <m.div
        className="pointer-events-none absolute inset-0 h-16"
        initial={{
          ['--pos']: direction === 'up' ? '-20%' : '200%',
        }}
        animate={{
          ['--pos']: direction === 'up' ? '200%' : '-20%',
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration,
          ease: 'linear',
        }}
        style={
          {
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) calc(var(--pos) - var(--band)), rgba(255,255,255,var(--a)) var(--pos), rgba(255,255,255,0) calc(var(--pos) + var(--band)), rgba(255,255,255,0) 100%)',
            ['--band' as any]: '24%',
            ['--a' as any]: highlightAlpha.toString(),
          } as React.CSSProperties
        }
      />
    </div>
  );
}
