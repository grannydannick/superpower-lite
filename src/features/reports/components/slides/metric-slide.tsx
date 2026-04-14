import { m } from 'framer-motion';

import { useCountUp } from '../../hooks/use-count-up';
import type { ReportMetric } from '../../types';

import {
  STATUS_ACCENT,
  STATUS_GLOW,
  STATUS_GRADIENTS,
  TAG_COLORS,
} from './slide-styles';

export function MetricSlide({ metric }: { metric: ReportMetric }) {
  const count = useCountUp({ end: metric.value, duration: 1500, delay: 300 });
  const gradient =
    STATUS_GRADIENTS[metric.status] ?? STATUS_GRADIENTS['neutral'];
  const glow = STATUS_GLOW[metric.status] ?? STATUS_GLOW['neutral'];
  const accent = STATUS_ACCENT[metric.status] ?? STATUS_ACCENT['neutral'];
  const tagColor = TAG_COLORS[metric.status] ?? TAG_COLORS['neutral'];

  return (
    <div
      className={`flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br ${gradient} px-8 py-16 text-center`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 35%, ${glow}, transparent 55%)`,
        }}
      />

      <m.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mb-6"
      >
        {metric.direction != null ? (
          <div className="flex flex-col items-center">
            <m.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[60px] font-black leading-none text-white"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.2)' }}
            >
              {metric.direction === 'down' ? '\u2193' : '\u2191'}
            </m.div>
            <div className="text-[64px] font-black tracking-tighter text-white">
              {count}
              <span className="text-[24px] font-normal">{metric.unit}</span>
            </div>
          </div>
        ) : (
          <div className="relative flex size-[160px] flex-col items-center justify-center rounded-full border-[3px] border-white/[0.08]">
            <m.div
              className="absolute inset-[-4px] rounded-full"
              style={{
                border: '4px solid transparent',
                borderTopColor: accent,
                borderRightColor: accent,
              }}
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="text-[56px] font-black leading-none tracking-tighter text-white">
              {count}
            </div>
            <div className="text-sm font-medium text-white/45">
              {metric.unit}
            </div>
          </div>
        )}
      </m.div>

      <m.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="relative z-10 text-[26px] font-extrabold leading-[1.1] tracking-tight text-white"
      >
        {metric.identity}
      </m.h2>

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.5 }}
        className={`relative z-10 mt-3 rounded-full px-3 py-1 text-xs font-semibold ${tagColor}`}
      >
        {metric.tag}
      </m.div>

      <m.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.7 }}
        className="relative z-10 mt-3 text-sm text-white/45"
      >
        {metric.label}
      </m.p>
    </div>
  );
}
