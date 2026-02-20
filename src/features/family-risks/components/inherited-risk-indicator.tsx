import { motion } from 'framer-motion';

import { Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

type InheritedRiskIndicatorProps = {
  score: number;
  variant?: 'light' | 'dark';
  className?: string;
};

/**
 * Visual indicator showing where a risk falls on the lifestyle-to-inherited spectrum
 * Score: 1 = mostly lifestyle, 10 = mostly inherited
 */
export function InheritedRiskIndicator({
  score,
  variant = 'light',
  className,
}: InheritedRiskIndicatorProps) {
  const position = ((score - 1) / 9) * 100;
  const leftPercent = 5 + position * 0.9;

  const isDark = variant === 'dark';

  return (
    <div className={cn('mx-auto max-w-xl space-y-3', className)}>
      <div className="relative">
        <div
          className={cn(
            'h-9 w-full rounded-full border',
            isDark
              ? 'border-white/20 bg-gradient-to-t from-white/5 to-white/20'
              : 'border-zinc-200 bg-zinc-100',
          )}
        >
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-px',
                  isDark ? 'bg-white/30' : 'bg-zinc-300',
                )}
              />
            ))}
          </div>
        </div>

        <motion.div
          className={cn(
            'absolute top-1/2 h-5 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-lg',
            isDark
              ? 'border-white/30 bg-gradient-to-t from-white/5 to-white/50 backdrop-blur-sm'
              : 'border-zinc-300 bg-white',
          )}
          initial={{ left: '5%' }}
          whileInView={{ left: `${leftPercent}%` }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 22,
            mass: 0.9,
          }}
          viewport={{ once: true, amount: 0.6 }}
        />
      </div>

      <div className="flex justify-between">
        <Body3 className={cn(isDark ? 'text-white' : 'text-zinc-500')}>
          Lifestyle-driven
        </Body3>
        <Body3 className={cn(isDark ? 'text-white' : 'text-zinc-500')}>
          Inherited
        </Body3>
      </div>
    </div>
  );
}
