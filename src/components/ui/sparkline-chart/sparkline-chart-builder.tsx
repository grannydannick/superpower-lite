import moment from 'moment';
import React from 'react';

import 'moment-timezone';
import { BiomarkerResult, Range } from '@/types/api';
import { getDisplayComparator } from '@/utils/get-display-comparator';

export class SparklineChartLegendBuilder {
  private props: {
    ranges: Range[];
    data: BiomarkerResult[];
    unit?: string;
    status: string;
  };

  constructor(
    ranges?: Range[],
    data?: BiomarkerResult[],
    unit?: string,
    status?: string,
  ) {
    this.props = {
      ranges: ranges || [],
      data: data || [],
      unit: unit,
      status: status || 'UNKNOWN',
    };
  }

  get ranges() {
    return this.props.ranges;
  }

  set ranges(ranges: Range[]) {
    this.props.ranges = ranges;
  }

  get data(): BiomarkerResult[] {
    return this.props.data;
  }

  set data(data: BiomarkerResult[]) {
    this.props.data = data;
  }

  get optimalRange(): Range | undefined {
    return this.props.ranges.find((r) => r.status === 'OPTIMAL');
  }

  get normalRange(): Range | undefined {
    return this.props.ranges.find((r) => r.status === 'NORMAL');
  }

  buildData() {
    return this.data
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
      .map((d, i) => ({
        x: i,
        // x: new Date(d.timestamp).getTime(),
        // y: Math.max(Math.min(d.quantity.value, max - padding), min + padding),
        y: this.transformValue(d),
        comparator: getDisplayComparator(d.quantity.comparator),
        value: d.quantity.value,
        dateFormatted: moment(d.timestamp)
          .tz(moment.tz.guess())
          .format('MMM D, YYYY'),
        unit: this.props.unit !== undefined ? this.props.unit : d.quantity.unit,
      }));
  }

  transformValue(d: any) {
    const min = this.min();
    const max = this.max();
    const padding = (max - min) * 0.1;

    const bound = this.bounds().find(
      (b) =>
        b?.low !== undefined &&
        b?.low <= d.quantity.value &&
        b?.high !== undefined &&
        d.quantity.value <= b?.high,
    );
    if (
      bound !== undefined &&
      bound?.low !== undefined &&
      bound?.high !== undefined
    ) {
      const plotBands = this.plotBands().filter(
        (b) => b.status === bound?.status,
      );

      if (plotBands.length === 0) throw Error("Can't find matching plotband");

      // Note: I know this is a complete hack and bad code
      // But since we're rewriting these charts I'll let it be
      // - Kingsley 05-14-2025

      // Right now if there are 2 normals, we push both of them with the
      // same band.Status onto plotBands.
      // The first one is high normal and the second one is low normal.
      // This is a hack to make we display it on the right one..
      let plotBand = plotBands[0];

      // There is high normal and low normal
      if (plotBands.length > 1 && bound?.status === 'NORMAL') {
        const optimalLowerBound = this.optimalBound()?.low;
        if (d.quantity.value < (optimalLowerBound ?? Infinity)) {
          plotBand = plotBands[1];
        }
      }

      const val =
        plotBand.from +
        ((d.quantity.value - bound?.low) / (bound?.high - bound?.low)) *
          (plotBand.to - plotBand.from);

      if (val > max - padding) {
        return max - padding;
      } else if (val < min + padding) {
        return min + padding;
      }
      return val;
    }

    // return d.quantity.value;
    return Math.max(Math.min(d.quantity.value, max - padding), min + padding);
  }

  private optimalBounded(): boolean {
    return this.optimalBoundedTop() && this.optimalBoundedBottom();
  }

  private optimalBoundedBottom(): boolean {
    return this.optimalRange?.low?.value !== undefined;
  }

  private optimalBoundedTop(): boolean {
    return this.optimalRange?.high?.value !== undefined;
  }

  private normalBounded(): boolean {
    return this.normalBoundedTop() && this.normalBoundedBottom();
  }

  private normalBoundedBottom(): boolean {
    return (
      this.normalRange?.low?.value !== undefined &&
      this.optimalRange?.low?.value !== undefined &&
      this.normalRange?.low?.value < this.optimalRange?.low?.value
    );
  }

  private normalBoundedTop(): boolean {
    return (
      this.normalRange?.high?.value !== undefined &&
      this.optimalRange?.high?.value !== undefined &&
      this.normalRange.high.value > this.optimalRange?.high?.value
    );
  }

  private highBound() {
    if (this.normalBounded()) {
      if (
        this.normalRange?.high?.value === undefined ||
        this.normalRange?.low?.value === undefined
      )
        throw Error(
          `Range not defined as expected: ${JSON.stringify(this.props.ranges)}`,
        );

      return {
        high:
          this.normalRange?.high?.value +
          (this.normalRange?.high?.value - this.normalRange?.low?.value) / 3,
        low: this.normalRange?.high?.value,
        status: 'HIGH',
      };
    } else if (this.normalBoundedTop()) {
      if (
        this.normalRange?.high?.value === undefined ||
        this.optimalRange?.high?.value === undefined
      )
        throw Error(
          `Range not defined as expected: ${JSON.stringify(this.props.ranges)}`,
        );

      return {
        high:
          this.normalRange?.high?.value +
          (this.normalRange?.high?.value - this.optimalRange?.high?.value),
        low: this.normalRange?.high?.value,
        status: 'HIGH',
      };
    } else if (this.optimalBounded()) {
      if (
        this.optimalRange?.high?.value === undefined ||
        this.optimalRange?.low?.value === undefined
      )
        throw Error(
          `Range not defined as expected: ${JSON.stringify(this.props.ranges)}`,
        );

      if (this.normalBoundedBottom()) {
        if (this.normalRange?.low?.value === undefined)
          throw Error('Range not defined as expected');

        return {
          low: this.optimalRange?.high?.value,
          high:
            this.optimalRange.high?.value +
            (this.optimalRange?.high?.value - this.normalRange?.low?.value) / 2,
          status: 'HIGH',
        };
      }

      return {
        high:
          this.optimalRange?.high?.value +
          (this.optimalRange?.high?.value - this.optimalRange?.low?.value) / 3,
        low: this.optimalRange?.high?.value,
        status: 'HIGH',
      };
    } else if (this.optimalBoundedTop()) {
      if (this.optimalRange?.high?.value === undefined)
        throw Error(
          `Range not defined as expected: ${JSON.stringify(this.props.ranges)}`,
        );

      return {
        high:
          this.optimalRange?.high?.value + this.optimalRange?.high?.value / 4,
        low: this.optimalRange?.high?.value,
        status: 'HIGH',
      };
    }

    return;
  }

  private normalUpperBound() {
    if (this.normalBoundedTop()) {
      return {
        high: this.normalRange?.high?.value,
        low: this.optimalRange?.high?.value,
        status: 'NORMAL',
      };
    }

    return;
  }

  private optimalBound() {
    if (this.optimalBounded()) {
      return {
        high: this.optimalRange?.high?.value,
        low: this.optimalRange?.low?.value,
        status: 'OPTIMAL',
      };
    } else if (this.optimalBoundedTop()) {
      return {
        high: this.optimalRange?.high?.value,
        low: 0,
        status: 'OPTIMAL',
      };
    } else if (this.optimalBoundedBottom() && this.normalBoundedBottom()) {
      return {
        high: (this.optimalRange?.low?.value || 1) * 3,
        low: this.optimalRange?.low?.value,
        status: 'OPTIMAL',
      };
    } else if (this.optimalBoundedBottom()) {
      return {
        high: (this.optimalRange?.low?.value || 1) * 4,
        low: this.optimalRange?.low?.value,
        status: 'OPTIMAL',
      };
    }

    return;
  }

  private normalLowerBound() {
    if (this.normalBoundedBottom()) {
      return {
        high: this.optimalRange?.low?.value,
        low: this.normalRange?.low?.value,
        status: 'NORMAL',
      };
    }

    return;
  }

  private lowBound() {
    if (this.normalBounded()) {
      if (
        this.normalRange?.high?.value === undefined ||
        this.normalRange?.low?.value === undefined
      )
        throw Error('Range not defined as expected');

      return {
        low:
          this.normalRange?.low?.value -
          (this.normalRange?.high?.value - this.normalRange?.low?.value) / 3,
        high: this.normalRange?.low?.value,
        status: 'LOW',
      };
    } else if (this.normalBoundedBottom()) {
      if (
        this.normalRange?.low?.value === undefined ||
        this.optimalRange?.low?.value === undefined
      )
        throw Error('Range not defined as expected');

      return {
        low:
          this.normalRange?.low?.value -
          (this.optimalRange?.low?.value - this.normalRange?.low?.value),
        high: this.normalRange?.low?.value,
        status: 'LOW',
      };
    } else if (this.optimalBounded()) {
      if (
        this.optimalRange?.high?.value === undefined ||
        this.optimalRange?.low?.value === undefined
      )
        throw Error('Range not defined as expected');

      if (this.normalBoundedTop()) {
        if (this.normalRange?.high?.value === undefined)
          throw Error('Range not defined as expected');

        return {
          low:
            this.optimalRange.low?.value -
            (this.normalRange?.high?.value - this.optimalRange.low?.value) / 2,
          high: this.optimalRange?.low?.value,
          status: 'LOW',
        };
      }

      return {
        low:
          this.optimalRange?.low?.value -
          (this.optimalRange?.high?.value - this.optimalRange?.low?.value) / 3,
        high: this.optimalRange?.low?.value,
        status: 'LOW',
      };
    } else if (this.optimalBoundedBottom()) {
      if (this.optimalRange?.low?.value === undefined)
        throw Error('Range not defined as expected');

      return {
        low: 0,
        high: this.optimalRange?.low?.value,
        status: 'LOW',
      };
    }

    return;
  }

  private bounds() {
    return [
      this.highBound(),
      this.normalUpperBound(),
      this.optimalBound(),
      this.normalLowerBound(),
      this.lowBound(),
    ].filter((i) => i !== undefined);
  }

  buildLegend(): JSX.Element {
    if (this.props.ranges.length === 0)
      throw Error("Can't build Sparkline Legend without specified ranges");
    // if (this.props.yValue === undefined) return <></>;

    const legend = [];

    if (this.highBound()) {
      legend.push(
        <div
          key="high-bound"
          style={{
            height: `20%`,
            backgroundColor: STATUS_PLOTLINE_COLORS.HIGH,
          }}
          className={`w-1 grow rounded-sm`}
        />,
      );
    }

    if (this.normalUpperBound()) {
      legend.push(
        <div
          key="normal-upper-bound"
          style={{
            height: `20%`,
            backgroundColor: STATUS_PLOTLINE_COLORS.NORMAL,
          }}
          className={`w-1 grow rounded-sm`}
        />,
      );
    }

    if (
      (!this.normalLowerBound() &&
        !this.lowBound() &&
        !this.normalUpperBound()) ||
      (!this.normalUpperBound() &&
        !this.highBound() &&
        !this.normalLowerBound())
    ) {
      legend.push(
        <div
          key="optimal-bound-large"
          style={{
            height: `80%`,
            backgroundColor: STATUS_PLOTLINE_COLORS.OPTIMAL,
          }}
          className={`w-1 grow rounded-sm`}
        />,
      );
    } else if (
      (!this.normalLowerBound() && !this.lowBound()) ||
      (!this.normalUpperBound() && !this.highBound()) ||
      (!this.normalLowerBound() && !this.normalUpperBound())
    ) {
      legend.push(
        <div
          key="optimal-bound-medium"
          style={{
            height: `60%`,
            backgroundColor: STATUS_PLOTLINE_COLORS.OPTIMAL,
          }}
          className={`w-1 grow rounded-sm`}
        />,
      );
    } else {
      legend.push(
        <div
          key="optimal-bound-small"
          style={{
            height: `20%`,
            backgroundColor: STATUS_PLOTLINE_COLORS.OPTIMAL,
          }}
          className={`w-1 grow rounded-sm`}
        />,
      );
    }

    if (this.normalLowerBound()) {
      legend.push(
        <div
          key="normal-lower-bound"
          style={{
            height: `20%`,
            backgroundColor: STATUS_PLOTLINE_COLORS.NORMAL,
          }}
          className={`w-1 grow rounded-sm`}
        />,
      );
    }

    if (this.lowBound()) {
      legend.push(
        <div
          key="low-bound"
          style={{
            height: `20%`,
            backgroundColor: STATUS_PLOTLINE_COLORS.LOW,
          }}
          className={`w-1 grow rounded-sm`}
        />,
      );
    }

    return (
      <div className="flex h-full w-2 flex-col place-items-center space-y-px">
        {legend}
      </div>
    );
  }

  colorFromStatus(status: string | undefined): string {
    switch (status) {
      case 'OPTIMAL':
        return STATUS_PLOTLINE_COLORS.OPTIMAL;
      case 'NORMAL':
        return STATUS_PLOTLINE_COLORS.NORMAL;
      case 'HIGH':
        return STATUS_PLOTLINE_COLORS.HIGH;
      case 'LOW':
        return STATUS_PLOTLINE_COLORS.LOW;
      default:
        return 'grey';
    }
  }

  buildZones() {
    const sortedPlotBands = this.plotBands().sort(
      (a, b) =>
        (a?.to !== undefined ? a?.to : Infinity) -
        (b?.to !== undefined ? b?.to : -Infinity),
    );

    return sortedPlotBands.map((b) => {
      return {
        value: b?.to,
        color: this.colorFromStatus(b?.status),
      };
    });
  }

  max(): number {
    const bounds = this.bounds().sort(
      (a, b) =>
        (a?.high !== undefined ? a?.high : Infinity) -
        (b?.high !== undefined ? b?.high : -Infinity),
    );

    const bound = bounds[bounds.length - 1];
    if (bound === undefined || bound.high === undefined)
      throw Error('Could not calculate bounds');

    return bound.high;
  }

  min(): number {
    const bounds = this.bounds().sort(
      (a, b) =>
        (a?.high !== undefined ? a?.high : Infinity) -
        (b?.high !== undefined ? b?.high : -Infinity),
    );

    const bound = bounds[0];
    if (bound === undefined || bound.low === undefined)
      throw Error('Could not calculate bounds');

    return bound.low;
  }

  findPlotBands(pt: any) {
    if (pt === undefined) return [];

    const plotBands = this.plotBands();
    const bound = plotBands.find(
      (b) =>
        (b?.from === undefined || b?.from <= pt.y) &&
        (b?.to === undefined || pt.y <= b?.to),
    );

    if (bound) {
      return [bound];
    }
    return [];
  }

  buildPlotBands() {
    const data = this.buildData();
    const lastPt = data[data.length - 1];

    return this.findPlotBands(lastPt);
  }

  plotBands() {
    if (this.props.ranges.length === 0)
      throw Error("Can't build Sparkline Legend without specified ranges");
    // if (this.props.yValue === undefined) return <></>;

    const plotBands = [];
    let progress = 0;

    let additional = 0;
    if (this.bounds().length === 4) additional = 0.05;

    if (this.highBound()) {
      plotBands.push({
        color: STATUS_PLOTBAND_COLORS['HIGH'],
        status: 'HIGH',
        to: this.max(),
        from: this.max() - (this.max() - this.min()) * (0.2 + additional),
      });
      progress += 0.2 + additional;
    }

    if (this.normalUpperBound()) {
      plotBands.push({
        color: STATUS_PLOTBAND_COLORS['NORMAL'],
        status: 'NORMAL',
        to: plotBands[plotBands.length - 1]?.from ?? this.max(),
        from:
          this.max() -
          (this.max() - this.min()) * (0.2 + progress + additional),
      });
      progress += 0.2 + additional;
    }

    if (
      (!this.normalLowerBound() &&
        !this.lowBound() &&
        !this.normalUpperBound()) ||
      (!this.normalUpperBound() &&
        !this.highBound() &&
        !this.normalLowerBound())
    ) {
      plotBands.push({
        color: STATUS_PLOTBAND_COLORS['OPTIMAL'],
        status: 'OPTIMAL',
        to: plotBands[plotBands.length - 1]?.from ?? this.max(),
        from: this.max() - (this.max() - this.min()) * (0.8 + progress),
      });
      progress += 0.8;
    } else if (
      (!this.normalLowerBound() && !this.lowBound()) ||
      (!this.normalUpperBound() && !this.highBound()) ||
      (!this.normalLowerBound() && !this.normalUpperBound())
    ) {
      plotBands.push({
        color: STATUS_PLOTBAND_COLORS['OPTIMAL'],
        status: 'OPTIMAL',
        to: plotBands[plotBands.length - 1]?.from ?? this.max(),
        from: this.max() - (this.max() - this.min()) * (0.6 + progress),
      });
      progress += 0.6;
    } else {
      plotBands.push({
        color: STATUS_PLOTBAND_COLORS['OPTIMAL'],
        status: 'OPTIMAL',
        to: plotBands[plotBands.length - 1]?.from ?? this.max(),
        from:
          this.max() -
          (this.max() - this.min()) * (0.2 + progress + additional),
      });
      progress += 0.2 + additional;
    }

    if (this.normalLowerBound()) {
      plotBands.push({
        color: STATUS_PLOTBAND_COLORS['NORMAL'],
        status: 'NORMAL',
        to: plotBands[plotBands.length - 1]?.from ?? this.max(),
        from:
          this.max() -
          (this.max() - this.min()) * (0.2 + progress + additional),
      });
      progress += 0.2 + additional;
    }

    if (this.lowBound()) {
      plotBands.push({
        color: STATUS_PLOTBAND_COLORS['LOW'],
        status: 'LOW',
        to: plotBands[plotBands.length - 1]?.from ?? this.max(),
        from:
          this.max() -
          (this.max() - this.min()) * (0.2 + progress + additional),
      });
      progress += 0.2 + additional;
    }

    return plotBands;
  }
}

const PLOTBAND_COLORS = {
  PINK: 'rgba(255, 102, 204, 0.1)',
  GREEN: 'rgba(102, 204, 153, 0.1)',
  YELLOW: 'rgba(255, 255, 153, 0.3)',
};

const PLOTLINE_COLORS = {
  PINK: 'rgb(255, 102, 204)',
  GREEN: 'rgb(102, 204, 153)',
  YELLOW: 'rgba(234, 214, 76, 1)',
};

const STATUS_PLOTLINE_COLORS = {
  OPTIMAL: PLOTLINE_COLORS.GREEN,
  HIGH: PLOTLINE_COLORS.PINK,
  LOW: PLOTLINE_COLORS.PINK,
  NORMAL: PLOTLINE_COLORS.YELLOW,
};

const STATUS_PLOTBAND_COLORS = {
  OPTIMAL: PLOTBAND_COLORS.GREEN,
  HIGH: PLOTBAND_COLORS.PINK,
  LOW: PLOTBAND_COLORS.PINK,
  NORMAL: PLOTBAND_COLORS.YELLOW,
  UNKNOWN: 'gray',
};
