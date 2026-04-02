import { useMemo } from 'react';

import { WearableMetric } from '@/features/wearables/const/wearable-metrics';

import { catmullRomToPath } from '../utils/catmull-rom';

const SVG_HEIGHT = 64;
const PADDING = 12;
const MAX_POINTS = 5;

export type SparklinePoint = {
  x: number;
  y: number;
  value: number;
  timestamp: string;
};

export function useWearablesSparkline({
  items,
  metric,
  svgWidth,
}: {
  items: Record<string, any>[];
  metric: WearableMetric;
  svgWidth: number;
}) {
  return useMemo(() => {
    const points: SparklinePoint[] = [];

    const sorted = [...items].sort(
      (a, b) =>
        new Date(metric.timestampAccessor(a)).getTime() -
        new Date(metric.timestampAccessor(b)).getTime(),
    );

    const allEntries: Array<{ value: number; timestamp: string }> = [];
    for (const row of sorted) {
      const v = metric.accessor(row);
      if (v != null) {
        allEntries.push({ value: v, timestamp: metric.timestampAccessor(row) });
      }
    }

    // Keep only the most recent data points to avoid busy charts
    const entries = allEntries.slice(-MAX_POINTS);

    if (entries.length === 0) {
      return {
        path: '',
        hasData: false as const,
        points: [] as SparklinePoint[],
        baselineY: null as number | null,
      };
    }

    const values = entries.map((e) => e.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const drawWidth = svgWidth - PADDING * 2;
    const drawHeight = SVG_HEIGHT - PADDING * 2;

    if (entries.length === 1) {
      // Single point — center it
      const e = entries[0];
      points.push({
        x: svgWidth / 2,
        y: SVG_HEIGHT / 2,
        value: e.value,
        timestamp: e.timestamp,
      });
    } else {
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const x = PADDING + (i / (entries.length - 1)) * drawWidth;
        const y = PADDING + drawHeight - ((e.value - min) / range) * drawHeight;
        points.push({ x, y, value: e.value, timestamp: e.timestamp });
      }
    }

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const baselineY =
      entries.length === 1
        ? SVG_HEIGHT / 2
        : PADDING + drawHeight - ((avg - min) / range) * drawHeight;

    return {
      path: catmullRomToPath(points, 1),
      hasData: true as const,
      points,
      baselineY,
    };
  }, [items, metric, svgWidth]);
}
