// src/features/onboarding-circle/components/primer-banner.tsx

import { m } from 'framer-motion';

import { cn } from '@/lib/utils';

interface PrimerBannerProps {
  completedCount: number;
}

export function PrimerBanner({ completedCount }: PrimerBannerProps) {
  const isUnlocked = completedCount >= 4;

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-xl p-5 text-center transition-all duration-500',
        isUnlocked
          ? 'border-[1.5px] border-[#FC5F2B] bg-gradient-to-br from-[#FFF8F5] to-white shadow-[0_0_0_4px_rgba(252,95,43,0.06),0_8px_32px_rgba(252,95,43,0.08)]'
          : 'border-[1.5px] border-dashed border-zinc-200 bg-zinc-50',
      )}
    >
      {/* Shimmer overlay for unlocked state */}
      {isUnlocked && (
        <div className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      )}

      <div className="relative">
        <h4 className="text-[15px] font-semibold tracking-tight text-zinc-900">
          {isUnlocked
            ? 'Your Pre-Protocol Primer is ready'
            : 'Pre-Protocol Primer'}
        </h4>
        <p className="mt-1 text-[13px] leading-snug text-zinc-400">
          {isUnlocked
            ? 'We connected the dots across all your health data. Your comprehensive overview is waiting.'
            : `Connect ${4 - completedCount} more source${4 - completedCount === 1 ? '' : 's'} to unlock your health overview.`}
        </p>

        {isUnlocked ? (
          <m.button
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#FC5F2B] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#e54f20]"
            onClick={() => {
              /* placeholder — no primer report in prototype */
            }}
          >
            View your primer
            <span>{'\u2192'}</span>
          </m.button>
        ) : (
          <div className="mt-3.5 flex justify-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <m.div
                key={i}
                className="h-1 w-8 rounded-full"
                animate={{
                  backgroundColor: i < completedCount ? '#FC5F2B' : '#e8e6e1',
                }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
        )}
      </div>
    </m.div>
  );
}
