import { useNavigate } from '@tanstack/react-router';
import { m } from 'framer-motion';

import { useReport } from '../report-context';

export function CtaSlide() {
  const navigate = useNavigate();
  const { report } = useReport();

  const handleQuestion = (question: string) => {
    void navigate({
      to: '/concierge' as any,
      search: { defaultMessage: question } as any,
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#3f3f46] px-7 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(252,95,43,0.08),transparent_50%)]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <m.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6 text-5xl"
        >
          {'\u2726'}
        </m.div>

        <m.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-3.5 text-[26px] font-extrabold leading-[1.15] tracking-tight text-white"
        >
          Your data is telling a story
        </m.h2>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8 max-w-[280px] text-[15px] leading-relaxed text-white/50"
        >
          {report.summary}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex w-full flex-col gap-2"
        >
          {report.ctaQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => handleQuestion(question)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-left text-sm font-medium text-white/70 backdrop-blur-lg transition-colors hover:bg-white/[0.08]"
            >
              {question}
            </button>
          ))}
        </m.div>
      </div>
    </div>
  );
}
