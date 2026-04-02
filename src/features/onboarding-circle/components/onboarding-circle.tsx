// src/features/onboarding-circle/components/onboarding-circle.tsx

import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { SOURCES, type SourceConfig, type SourceId } from '../const/sources';
import { useOnboardingCircleStore } from '../stores/onboarding-circle-store';

import { PrimerBanner } from './primer-banner';
import { ProgressRing } from './progress-ring';
import { SourceCard } from './source-card';
import { SourceDetailModal } from './source-detail-modal';

const CELEBRATION_COLORS = ['#FC5F2B', '#3b82f6', '#a855f7', '#11c182'];

function CelebrationParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const rad = (angle * Math.PI) / 180;
    const distance = 60 + Math.random() * 40;
    const tx = Math.cos(rad) * distance;
    const ty = Math.sin(rad) * distance;
    return { tx, ty, color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length], delay: i * 0.03 };
  });

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
      {particles.map((p, i) => (
        <m.div
          key={i}
          className="absolute size-2 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.tx,
            y: p.ty,
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function OnboardingCircle() {
  const completedSources = useOnboardingCircleStore((s) => s.completedSources);
  const completedCount = completedSources.size;
  const prevCountRef = useRef(completedCount);
  const [showCelebration, setShowCelebration] = useState(false);
  const [modalSource, setModalSource] = useState<SourceConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (completedCount === 4 && prevCountRef.current < 4) {
      setShowCelebration(true);
      const timeout = setTimeout(() => setShowCelebration(false), 1200);
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = completedCount;
  }, [completedCount]);

  const handleArcClick = (sourceId: SourceId) => {
    const source = SOURCES.find((s) => s.id === sourceId);
    if (source == null) return;

    if (completedSources.has(sourceId)) {
      const card = document.getElementById(`source-card-${sourceId}`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setModalSource(source);
    setModalOpen(true);
  };

  const handleCardClick = (source: SourceConfig) => {
    if (source.autoComplete) return;
    setModalSource(source);
    setModalOpen(true);
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex w-full max-w-lg flex-col gap-6 pb-6"
    >
      {/* Progress Ring */}
      <div className="relative">
        <ProgressRing
          completedSources={completedSources}
          completedCount={completedCount}
          onArcClick={handleArcClick}
        />
        <AnimatePresence>
          {showCelebration && <CelebrationParticles />}
        </AnimatePresence>
      </div>

      {/* Tagline */}
      <m.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-center text-sm text-zinc-500"
      >
        Connect your data to unlock{' '}
        <strong className="bg-gradient-to-r from-[#FC5F2B] to-amber-500 bg-clip-text font-semibold text-transparent">
          early insights
        </strong>
      </m.p>

      {/* Label chips */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {SOURCES.map((source) => {
          const done = completedSources.has(source.id);
          return (
            <button
              key={source.id}
              type="button"
              onClick={() => handleArcClick(source.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                done
                  ? 'border border-zinc-200 bg-white text-zinc-900'
                  : 'bg-zinc-100 text-zinc-400',
              )}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: source.colorFrom }}
              />
              {source.label}
              {done && (
                <span className="text-[10px] font-bold text-emerald-500">
                  {'\u2713'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section header */}
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">
          Your data sources
        </h3>
        <span className="text-xs font-medium text-zinc-400">
          {completedCount} of 4
        </span>
      </div>

      {/* Source cards */}
      <div className="flex flex-col gap-2.5">
        {SOURCES.map((source, i) => (
          <div key={source.id} id={`source-card-${source.id}`}>
            <SourceCard
              source={source}
              isComplete={completedSources.has(source.id)}
              index={i}
              onClick={() => handleCardClick(source)}
            />
          </div>
        ))}
      </div>

      {/* Primer banner */}
      <PrimerBanner completedCount={completedCount} />

      {/* Modal */}
      <SourceDetailModal
        source={modalSource}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </m.div>
  );
}
