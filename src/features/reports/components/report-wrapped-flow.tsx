import { AnimatePresence, m } from 'framer-motion';
import { type ComponentType, useMemo } from 'react';

import {
  useScreenSequence,
  SequenceProvider,
  useSequence,
} from '@/features/onboarding/hooks/use-screen-sequence';

import type { ParsedReport, ReportMetric } from '../types';

import { ReportProvider } from './report-context';
import { ShareButton } from './share-card';
import { ConnectionSlide } from './slides/connection-slide';
import { CorrelationConnectionSlide } from './slides/correlation-connection-slide';
import { CorrelationSlide } from './slides/correlation-slide';
import { CtaSlide } from './slides/cta-slide';
import { MetricSlide } from './slides/metric-slide';
import { NextStepsSlide } from './slides/next-steps-slide';
import { TitleSlide } from './slides/title-slide';

function MetricSlideWithShare({ metric }: { metric: ReportMetric }) {
  return (
    <>
      <ShareButton metric={metric} />
      <MetricSlide metric={metric} />
    </>
  );
}

function buildSlides(
  report: ParsedReport,
): ComponentType<Record<string, never>>[] {
  const slides: ComponentType<Record<string, never>>[] = [];

  slides.push(TitleSlide);

  for (let i = 0; i < report.metrics.length; i++) {
    const metric = report.metrics[i]!;
    const connection = report.connections.find((c) => c.metricIndex === i);

    slides.push(() => <MetricSlideWithShare metric={metric} />);
    if (connection != null) {
      slides.push(() => (
        <ConnectionSlide connection={connection} metric={metric} />
      ));
    }
  }

  if (report.correlation != null) {
    const corr = report.correlation;
    slides.push(() => <CorrelationSlide correlation={corr} />);
    slides.push(() => <CorrelationConnectionSlide correlation={corr} />);
  }

  if (report.nextSteps.length > 0) {
    const steps = report.nextSteps;
    slides.push(() => <NextStepsSlide steps={steps} />);
  }

  slides.push(CtaSlide);

  return slides;
}

function ProgressBar() {
  const { screenIndex, totalScreens } = useSequence();

  return (
    <div className="absolute left-5 right-5 top-4 z-20 flex gap-1">
      {Array.from({ length: totalScreens }).map((_, i) => (
        <div
          key={i}
          className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
            i < screenIndex
              ? 'bg-white/45'
              : i === screenIndex
                ? 'bg-white/90'
                : 'bg-white/15'
          }`}
        />
      ))}
    </div>
  );
}

function TapNavigation() {
  const { next, back } = useSequence();

  return (
    <>
      <button
        type="button"
        className="absolute inset-y-0 left-0 z-10 w-[35%]"
        onClick={back}
        tabIndex={-1}
        aria-label="Previous slide"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 z-10 w-[65%]"
        onClick={next}
        tabIndex={-1}
        aria-label="Next slide"
      />
    </>
  );
}

export function ReportWrappedFlow({
  report,
  sourceId,
  onComplete,
}: {
  report: ParsedReport;
  sourceId: string;
  onComplete: () => void;
}) {
  const slides = useMemo(() => buildSlides(report), [report]);

  const { Screen, screenIndex, sequenceValue } = useScreenSequence({
    screens: slides,
    onComplete,
  });

  return (
    <ReportProvider value={{ report, sourceId }}>
      <SequenceProvider value={sequenceValue}>
        <div className="relative min-h-dvh overflow-hidden">
          <ProgressBar />
          <TapNavigation />
          <AnimatePresence mode="wait">
            <m.div
              key={screenIndex}
              className="min-h-dvh"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Screen />
            </m.div>
          </AnimatePresence>
        </div>
      </SequenceProvider>
    </ReportProvider>
  );
}
