import { m } from 'framer-motion';

import type { ReportCorrelation } from '../../types';

export function CorrelationSlide({
  correlation,
}: {
  correlation: ReportCorrelation;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#4c1d95] px-8 py-16 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_35%,rgba(168,85,247,0.12),transparent_55%)]" />

      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-6 flex items-center gap-3.5"
      >
        <div className="flex size-[76px] flex-col items-center justify-center rounded-full border-2 border-white/10 bg-white/[0.03] text-[22px]">
          {correlation.from.emoji}
          <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-white/35">
            {correlation.from.label}
          </div>
        </div>

        <m.div
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[22px] text-white/20"
        >
          {'\u2192'}
        </m.div>

        <div className="flex size-[76px] flex-col items-center justify-center rounded-full border-2 border-white/10 bg-white/[0.03] text-[22px]">
          {correlation.to.emoji}
          <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-white/35">
            {correlation.to.label}
          </div>
        </div>
      </m.div>

      <m.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 text-[26px] font-extrabold leading-[1.1] tracking-tight text-white"
      >
        {correlation.identity}
      </m.h2>

      <m.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative z-10 mt-3 max-w-[280px] text-sm text-white/50"
      >
        {correlation.body}
      </m.p>
    </div>
  );
}
