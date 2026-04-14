import { useNavigate } from '@tanstack/react-router';
import { BrainCircuit, Loader2, TestTubes, Watch } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Body2 } from '@/components/ui/typography';
import type { SourceId } from '@/features/onboarding-circle/const/sources';
import {
  useReportStore,
  type ReportEntry,
} from '@/features/onboarding-circle/stores/report-store';

interface SourceStyle {
  gradient: string;
  icon: LucideIcon;
  label: string;
  fallbackTitle: string;
}

const SOURCE_STYLES: Record<string, SourceStyle> = {
  wearables: {
    gradient: 'from-[#1a1a2e] to-[#16213e]',
    icon: Watch,
    label: 'From wearables',
    fallbackTitle: 'Your wearable insights',
  },
  labs: {
    gradient: 'from-[#134e4a] to-[#0f766e]',
    icon: TestTubes,
    label: 'From uploaded labs',
    fallbackTitle: 'Your lab insights',
  },
  'ai-context': {
    gradient: 'from-[#4c1d95] to-[#7c3aed]',
    icon: BrainCircuit,
    label: 'From AI conversations',
    fallbackTitle: 'Your health themes',
  },
};

const SOURCE_ORDER: SourceId[] = ['wearables', 'labs', 'ai-context'];

function ReportCard({
  sourceId,
  report,
}: {
  sourceId: string;
  report: ReportEntry;
}) {
  const navigate = useNavigate();
  const style = SOURCE_STYLES[sourceId];
  if (style == null) return null;

  const Icon = style.icon;
  const isReady = report.status === 'ready';
  const title = report.title ?? style.fallbackTitle;

  const handleClick = () => {
    if (!isReady) return;
    if (report.parsedReport != null) {
      void navigate({ to: `/reports/${sourceId}` as any });
    } else {
      void navigate({ to: `/concierge/${report.threadId}` as any });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isReady}
      className={`relative aspect-square w-40 shrink-0 snap-start overflow-hidden rounded-xl bg-gradient-to-br ${style.gradient} text-left transition-transform hover:scale-[1.02] disabled:hover:scale-100`}
    >
      {/* Source icon */}
      <div className="absolute left-2.5 top-2.5 flex size-7 items-center justify-center rounded-lg bg-white/10">
        <Icon className="size-3.5 text-white" />
      </div>

      {/* Bottom text */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-8">
        <div className="text-xs font-semibold leading-tight text-white">
          {title}
        </div>
        <div className="mt-0.5 text-[10px] text-white/50">{style.label}</div>
      </div>
    </button>
  );
}

function GeneratingCard() {
  return (
    <div className="flex aspect-square w-40 shrink-0 snap-start items-center justify-center rounded-xl bg-zinc-100">
      <div className="text-center">
        <Loader2 className="mx-auto mb-1.5 size-5 animate-spin text-zinc-400" />
        <Body2 className="text-zinc-400">Generating...</Body2>
      </div>
    </div>
  );
}

export const InsightCarouselCard = () => {
  const reports = useReportStore((s) => s.reports);

  const entries: { sourceId: SourceId; report: ReportEntry }[] = [];
  for (const sourceId of SOURCE_ORDER) {
    const report = reports[sourceId];
    if (report != null) {
      entries.push({ sourceId, report });
    }
  }

  if (entries.length === 0) return null;

  return (
    <div>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        Your insights
      </div>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {entries.map(({ sourceId, report }) =>
          report.status === 'generating' ? (
            <GeneratingCard key={sourceId} />
          ) : (
            <ReportCard key={sourceId} sourceId={sourceId} report={report} />
          ),
        )}
      </div>
    </div>
  );
};
