import { m } from 'framer-motion';
import { useState } from 'react';

import { Body3, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { SOURCES, type SourceConfig, type SourceId } from '../const/sources';
import { useOnboardingCircleStore } from '../stores/onboarding-circle-store';

import { ActiveIndicator, CompleteIndicator } from './active-indicator';
import { SourceDetailModal } from './source-detail-modal';
import { SourceRow } from './source-row';

function SegmentedProgress({ completedCount }: { completedCount: number }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 w-6 rounded-full transition-colors duration-300',
            i < completedCount ? 'bg-vermillion-900' : 'bg-zinc-100',
          )}
        />
      ))}
    </div>
  );
}

export function OnboardingCircle() {
  const completedSources = useOnboardingCircleStore((s) => s.completedSources);
  const completedCount = completedSources.size;
  const allComplete = completedCount >= 4;
  const [modalSource, setModalSource] = useState<SourceConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (source: SourceConfig) => {
    if (source.autoComplete && completedSources.has(source.id)) return;
    setModalSource(source);
    setModalOpen(true);
  };

  let nextActionId: SourceId | null = null;
  for (const source of SOURCES) {
    if (!completedSources.has(source.id)) {
      nextActionId = source.id;
      break;
    }
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex w-full max-w-[548px] flex-col gap-1.5"
    >
      {/* Header card */}
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg shadow-black/5">
        {allComplete ? <CompleteIndicator /> : <ActiveIndicator />}
        <div className="min-w-0 flex-1">
          <H4 className="text-zinc-900">
            {allComplete
              ? 'Your health profile is complete'
              : 'Complete your health profile'}
          </H4>
          <Body3 className="p-0 text-zinc-400">
            {allComplete
              ? 'Your data is ready to power better insights'
              : `${completedCount} of 4 sources connected`}
          </Body3>
        </div>
        <SegmentedProgress completedCount={completedCount} />
      </div>

      {/* Source rows */}
      {SOURCES.map((source) => (
        <SourceRow
          key={source.id}
          source={source}
          isComplete={completedSources.has(source.id)}
          isNextAction={source.id === nextActionId}
          onClick={() => handleRowClick(source)}
        />
      ))}

      {/* Modal */}
      <SourceDetailModal
        source={modalSource}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </m.div>
  );
}
