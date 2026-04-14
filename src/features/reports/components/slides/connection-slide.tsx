import { m } from 'framer-motion';

import type { ReportConnection, ReportMetric } from '../../types';

import {
  SOURCE_COLORS,
  SOURCE_LABELS,
  STATUS_GRADIENTS,
  STATUS_GLOW,
} from './slide-styles';

export function ConnectionSlide({
  connection,
  metric,
}: {
  connection: ReportConnection;
  metric: ReportMetric;
}) {
  const gradient =
    STATUS_GRADIENTS[metric.status] ?? STATUS_GRADIENTS['neutral'];
  const glow = STATUS_GLOW[metric.status] ?? STATUS_GLOW['neutral'];

  return (
    <div
      className={`flex min-h-dvh flex-col bg-gradient-to-br ${gradient} px-7 py-16`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${glow.replace('0.12', '0.08').replace('0.2', '0.12').replace('0.15', '0.08')}, transparent 55%)`,
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-3.5 flex flex-wrap items-center gap-1.5"
        >
          {connection.sources.map((s, i) => (
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
          {connection.headline}
        </m.h2>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-5 text-[15px] leading-[1.7] text-white/60"
        >
          {connection.body}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="rounded-[14px] border border-white/[0.08] bg-white/[0.06] p-4 backdrop-blur-lg"
        >
          <div
            className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              color: SOURCE_COLORS[connection.sources[0] ?? ''] ?? '#a78bfa',
            }}
          >
            {connection.callout.label}
          </div>
          <div className="text-[13px] leading-relaxed text-white/55">
            {connection.callout.text}
          </div>
        </m.div>
      </div>
    </div>
  );
}
