import { m } from 'framer-motion';
import { BrainCircuit, TestTubes, Watch } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useReport } from '../report-context';

import { SOURCE_COLORS, SOURCE_LABELS } from './slide-styles';

const SOURCE_ICONS: Record<string, LucideIcon> = {
  wearables: Watch,
  labs: TestTubes,
  'ai-context': BrainCircuit,
};

export function TitleSlide() {
  const { report, sourceId } = useReport();
  const Icon = SOURCE_ICONS[sourceId] ?? Watch;

  const connectedSources = new Set<string>();
  connectedSources.add(sourceId);
  for (const conn of report.connections) {
    for (const s of conn.sources) connectedSources.add(s);
  }
  if (report.correlation != null) {
    for (const s of report.correlation.connection.sources)
      connectedSources.add(s);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#0f172a] to-[#1e1b4b] px-8 py-16 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(99,102,241,0.2),transparent_55%)]" />

      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex size-[72px] items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.07] backdrop-blur-lg"
      >
        <Icon className="size-8 text-white" />
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 mt-7 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35"
      >
        {sourceId === 'wearables'
          ? 'Wearable Report'
          : sourceId === 'labs'
            ? 'Lab Report'
            : 'Health Context Report'}
      </m.div>

      <m.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="relative z-10 mt-2.5 text-[30px] font-extrabold leading-[1.1] tracking-tight text-white"
      >
        {report.title}
      </m.h1>

      <m.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10 mt-3.5 max-w-[280px] text-[15px] leading-relaxed text-white/50"
      >
        We connected your data with everything we know about you.
      </m.p>

      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="relative z-10 mt-6 flex flex-wrap justify-center gap-1.5"
      >
        {Array.from(connectedSources).map((s) => (
          <div
            key={s}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/45"
          >
            <div
              className="size-1.5 rounded-full"
              style={{ backgroundColor: SOURCE_COLORS[s] ?? '#a1a1aa' }}
            />
            {SOURCE_LABELS[s] ?? s}
          </div>
        ))}
      </m.div>
    </div>
  );
}
