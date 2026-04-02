// src/features/onboarding-circle/components/source-card.tsx

import { m } from 'framer-motion';

import { cn } from '@/lib/utils';

import type { SourceConfig } from '../const/sources';

interface SourceCardProps {
  source: SourceConfig;
  isComplete: boolean;
  index: number;
  onClick: () => void;
}

export function SourceCard({ source, isComplete, index, onClick }: SourceCardProps) {
  return (
    <m.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.4, ease: 'easeOut' }}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
        isComplete
          ? 'border-emerald-200/60 bg-white'
          : 'border-zinc-200 bg-white hover:-translate-y-px hover:border-zinc-300 hover:shadow-md hover:shadow-black/[0.03]',
      )}
    >
      {/* Subtle gradient overlay for completed cards */}
      {isComplete && (
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-50/50 to-transparent" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className="flex size-[42px] shrink-0 items-center justify-center rounded-[11px] text-xl"
            style={{ background: source.colorBg }}
          >
            {source.icon}
          </div>
          <div>
            <h4 className="text-[15px] font-semibold leading-snug tracking-tight text-zinc-900">
              {source.id === 'intake' && 'Health intake'}
              {source.id === 'wearables' && 'Wearables'}
              {source.id === 'ai-context' && 'AI health context'}
              {source.id === 'labs' && 'Previous lab results'}
            </h4>
            <p className="mt-0.5 text-xs text-zinc-400">
              {source.id === 'intake' && 'Symptoms, goals, history'}
              {source.id === 'wearables' && 'Apple Health, Oura, Whoop'}
              {source.id === 'ai-context' && 'ChatGPT, Claude conversations'}
              {source.id === 'labs' && 'Upload past blood work'}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'mt-0.5 shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium',
            isComplete
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-zinc-100 text-zinc-400',
          )}
        >
          {isComplete ? 'Complete' : source.timeEstimate ?? '\u2014'}
        </span>
      </div>

      {/* Early insight (shown when complete) */}
      {isComplete && (
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-3.5 rounded-[10px] border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-emerald-50/10 p-3.5"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
            Early insight
          </span>
          <p
            className="mt-1.5 text-[13px] leading-relaxed text-zinc-500 [&>strong]:font-semibold [&>strong]:text-zinc-900"
            dangerouslySetInnerHTML={{
              __html: source.earlyInsight.replace(
                /\*\*(.*?)\*\*/g,
                '<strong>$1</strong>',
              ),
            }}
          />
        </m.div>
      )}
    </m.button>
  );
}
