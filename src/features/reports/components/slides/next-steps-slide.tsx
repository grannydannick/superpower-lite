import { m } from 'framer-motion';

import type { ReportNextStep } from '../../types';

export function NextStepsSlide({ steps }: { steps: ReportNextStep[] }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-[#18181b] via-[#1c1917] to-[#292524] px-7 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(252,95,43,0.05),transparent_50%),radial-gradient(ellipse_at_70%_60%,rgba(52,211,153,0.05),transparent_50%)]" />

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30"
        >
          What&apos;s next
        </m.div>

        <m.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6 text-[26px] font-extrabold leading-[1.1] tracking-tight text-white"
        >
          What your protocol will focus on
        </m.h2>

        <div className="flex flex-col gap-2.5">
          {steps.map((step, i) => (
            <m.div
              key={step.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-3.5 rounded-[14px] border border-white/[0.06] bg-white/[0.04] p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-lg">
                {step.emoji}
              </div>
              <div>
                <div className="text-sm font-semibold text-white/90">
                  {step.title}
                </div>
                <div className="mt-0.5 text-xs text-white/45">
                  {step.detail}
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </div>
  );
}
