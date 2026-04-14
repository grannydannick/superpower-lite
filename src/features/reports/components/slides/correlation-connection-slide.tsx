import { m } from 'framer-motion';

import type { ReportCorrelation } from '../../types';

import { SOURCE_COLORS, SOURCE_LABELS } from './slide-styles';

export function CorrelationConnectionSlide({
  correlation,
}: {
  correlation: ReportCorrelation;
}) {
  const conn = correlation.connection;

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#4c1d95] px-7 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_35%,rgba(168,85,247,0.08),transparent_55%)]" />

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-3.5 flex flex-wrap items-center gap-1.5"
        >
          {conn.sources.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[10px] text-white/15">+</span>}
              <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-white/50">
                <div
                  className="size-[5px] rounded-full"
                  style={{ backgroundColor: SOURCE_COLORS[s] ?? '#a1a1aa' }}
                />
                {SOURCE_LABELS[s] ?? s}
              </div>
            </div>
          ))}
        </m.div>

        <m.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4 text-[22px] font-extrabold leading-[1.15] tracking-tight text-white"
        >
          {conn.headline}
        </m.h2>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-5 text-[15px] leading-[1.7] text-white/60"
        >
          {conn.body}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="rounded-[14px] border border-white/[0.08] bg-white/[0.06] p-4 backdrop-blur-lg"
        >
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-400">
            {conn.callout.label}
          </div>
          <div className="text-[13px] leading-relaxed text-white/55">
            {conn.callout.text}
          </div>
        </m.div>
      </div>
    </div>
  );
}
