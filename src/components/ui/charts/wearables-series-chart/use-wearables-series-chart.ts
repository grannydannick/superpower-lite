import { useMemo } from 'react';

import { catmullRomToPath } from '../utils/catmull-rom';

import { CHART_CONFIG } from './config';

export type Interval = 'day' | 'week' | 'month' | 'year' | 'all';

export type ChartDataPoint = {
  timestamp: string;
  value: number;
};

function formatXLabel(date: Date, interval: Interval): string {
  switch (interval) {
    case 'day':
      return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
    case 'week':
      return date.toLocaleDateString([], { weekday: 'short' });
    case 'month':
      return date.toLocaleDateString([], { day: 'numeric' });
    case 'year':
      return date.toLocaleDateString([], { month: 'short' });
    case 'all':
      return date.toLocaleDateString([], {
        month: 'short',
        year: '2-digit',
      });
  }
}

function compactNumber(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${+(v / 1_000_000).toPrecision(3)}m`;
  if (abs >= 1_000) return `${+(v / 1_000).toPrecision(3)}k`;
  return String(+v.toPrecision(4));
}

function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range));
  const frac = range / Math.pow(10, exp);
  let nice: number;
  if (round) {
    nice = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  } else {
    nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  }
  return nice * Math.pow(10, exp);
}

function computeNiceTicks(min: number, max: number, tickCount: number) {
  const range = niceNum(max - min || 1, false);
  const spacing = niceNum(range / (tickCount - 1), true);
  const niceMin = Math.floor(min / spacing) * spacing;
  const niceMax = Math.ceil(max / spacing) * spacing;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + spacing * 0.5; v += spacing) {
    ticks.push(parseFloat(v.toPrecision(10)));
  }
  return { ticks, niceMin, niceMax };
}

export function useWearablesSeriesChart({
  data,
  unit,
  formatValue,
  interval,
  baseline,
  svgWidth,
  svgHeight = CHART_CONFIG.SVG_HEIGHT,
}: {
  data: ChartDataPoint[];
  unit: string;
  formatValue: (v: number) => string;
  interval: Interval;
  baseline?: number;
  svgWidth: number;
  svgHeight?: number;
}) {
  return useMemo(() => {
    if (data.length === 0) {
      return {
        hasData: false as const,
        path: '',
        points: [] as Array<{
          x: number;
          y: number;
          timestamp: string;
          value: number;
        }>,
        yTicks: [] as Array<{ value: number; label: string; y: number }>,
        xLabels: [] as Array<{ label: string; x: number }>,
        baselineY: null as number | null,
        drawArea: { x: 0, y: 0, width: 0, height: 0 },
      };
    }

    const {
      LEFT_PADDING,
      RIGHT_PADDING,
      TOP_PADDING,
      BOTTOM_PADDING,
      DATA_INSET,
      Y_TICK_COUNT,
    } = CHART_CONFIG;

    const drawX = LEFT_PADDING;
    const drawY = TOP_PADDING;
    const drawWidth = Math.max(1, svgWidth - LEFT_PADDING - RIGHT_PADDING);
    const drawHeight = Math.max(1, svgHeight - TOP_PADDING - BOTTOM_PADDING);

    // Inset so data line doesn't start/end at the y-axis border
    const dataLeft = drawX + DATA_INSET;
    const dataWidth = Math.max(1, drawWidth - DATA_INSET * 2);

    const values = data.map((d) => d.value);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);

    let rangeMin = dataMin;
    let rangeMax = dataMax;
    if (baseline != null) {
      rangeMin = Math.min(rangeMin, baseline);
      rangeMax = Math.max(rangeMax, baseline);
    }

    const { ticks, niceMin, niceMax } = computeNiceTicks(
      rangeMin,
      rangeMax,
      Y_TICK_COUNT,
    );
    const yRange = niceMax - niceMin || 1;

    const toY = (v: number) =>
      drawY + drawHeight - ((v - niceMin) / yRange) * drawHeight;

    const timestamps = data.map((d) => new Date(d.timestamp).getTime());
    const tMin = Math.min(...timestamps);
    const tMax = Math.max(...timestamps);
    const tRange = tMax - tMin;

    // Center single data points; otherwise distribute by timestamp
    const toX = (t: number) =>
      tRange === 0
        ? dataLeft + dataWidth / 2
        : dataLeft + ((t - tMin) / tRange) * dataWidth;

    const points = data.map((d) => {
      const t = new Date(d.timestamp).getTime();
      return {
        x: toX(t),
        y: toY(d.value),
        timestamp: d.timestamp,
        value: d.value,
      };
    });

    const path = catmullRomToPath(points);

    const yTicks = ticks.map((v) => ({
      value: v,
      label: compactNumber(v),
      y: toY(v),
    }));

    const maxXLabels = Math.max(2, Math.floor(drawWidth / 60));
    const rawLabels: Array<{ label: string; x: number }> = [];
    for (let i = 0; i <= maxXLabels; i++) {
      const t = tMin + (i / maxXLabels) * tRange;
      rawLabels.push({
        label: formatXLabel(new Date(t), interval),
        x: toX(t),
      });
    }

    // Merge consecutive duplicate labels, then distribute evenly
    const uniqueLabels: string[] = [];
    let groupStart = 0;
    for (let i = 1; i <= rawLabels.length; i++) {
      if (
        i < rawLabels.length &&
        rawLabels[i].label === rawLabels[groupStart].label
      )
        continue;
      uniqueLabels.push(rawLabels[groupStart].label);
      groupStart = i;
    }
    const count = uniqueLabels.length;
    const xLabels = uniqueLabels.map((label, i) => ({
      label,
      x:
        count === 1
          ? dataLeft + dataWidth / 2
          : dataLeft + (i / (count - 1)) * dataWidth,
    }));

    const baselineY = baseline != null ? toY(baseline) : null;

    return {
      hasData: true as const,
      path,
      points,
      yTicks,
      xLabels,
      baselineY,
      drawArea: { x: drawX, y: drawY, width: drawWidth, height: drawHeight },
    };
  }, [data, unit, formatValue, interval, baseline, svgWidth, svgHeight]);
}
