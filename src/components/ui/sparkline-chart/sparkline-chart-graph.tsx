import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import React, { memo, useMemo } from 'react';

import { SparklineChartLegendBuilder } from './sparkline-chart-builder';

export const SparkLineChartGraph = memo((props: any) => {
  const builder = useMemo(
    () =>
      new SparklineChartLegendBuilder(
        props.ranges,
        props.data,
        props.unit,
        props.status,
      ),
    [props.ranges, props.data, props.unit, props.status],
  );

  const zones = useMemo(() => builder.buildZones(), [builder]);
  const plotBands = useMemo(() => builder.buildPlotBands(), [builder]);
  const min = useMemo(() => builder.min(), [builder]);
  const max = useMemo(() => builder.max(), [builder]);
  const data = useMemo(() => builder.buildData(), [builder]);

  const height = props.height || 80; // Default height

  // Original default values (replace these with the correct defaults)
  const defaultMarkerRadius = 12;
  const defaultMarkerLineWidth = 3;

  // Allow overriding defaults via props
  const markerRadius =
    props.markerRadius !== undefined ? props.markerRadius : defaultMarkerRadius;
  const markerLineWidth =
    props.markerLineWidth !== undefined
      ? props.markerLineWidth
      : defaultMarkerLineWidth;

  const options: Highcharts.Options = useMemo(() => {
    return {
      chart: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: 'transparent',
        height: height,
        width: null,
        margin: [0, 0, 0, 0],
        spacing: [0, 0, 0, 0],
        style: {
          overflow: 'hidden',
        },
        events: {
          load(): void {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const chart = this;
            const series = chart.series[0];
            if (series.data.length > 0) {
              const point = series.data.slice(-4)[0];
              if (!point) return;

              const x = chart.plotLeft + chart.xAxis[0].toPixels(point.x, true);
              const y =
                chart.plotTop + chart.yAxis[0].toPixels(point.y ?? 0, true);

              // Only render the path if we have valid coordinates
              if (isFinite(x) && isFinite(y)) {
                chart.renderer
                  .path(['M', chart.plotLeft, y, 'L', x, y] as any)
                  .attr({
                    stroke: point.color,
                    'stroke-width': 2,
                    'stroke-dasharray': '0 3 0',
                    zIndex: 10,
                  })
                  .add();
              }
            }
          },
        },
      },
      title: {
        text: undefined,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        tickPixelInterval: 20,
        type: 'category',
        tickmarkPlacement: 'on',
        labels: {
          enabled: false,
        },
        title: {
          text: null,
        },
        tickPositions: [],
        ordinal: false,
        lineWidth: 0,
      },
      yAxis: {
        min: min,
        max: max,
        labels: {
          enabled: false,
          format: '{value:.2f}',
        },
        gridLineWidth: 0,
        plotBands: plotBands,
        title: {
          text: null,
        },
        alignTicks: false,
        startOnTick: false,
        endOnTick: false,
        lineWidth: 0,
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        hideDelay: 0,
        outside: true,
        shared: true,
        useHTML: true,
        borderRadius: 10,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        shadow: false,
        headerFormat: undefined,
        formatter: function () {
          return `<div class="shadow bg-white flex flex-row gap-x-2 items-center py-2 px-4 rounded-md"><span class="block" style="height: 10px; width: 10px; border-radius: 100%; background-color: ${
            this.point.color
          };"></span><div><b>${(this.point as any).comparator} ${(this.point as any).value}</b><span style="color: gray;">${
            ' ' + (this.point as any).unit
          }<span class="ml-3">${(this.point as any).dateFormatted}</span></div></div>`;
        },
      },
      plotOptions: {
        series: {
          animation: false,
          lineWidth: 0,
          shadow: false,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          marker: {
            radius: markerRadius / 2, // Custom or default marker radius
            symbol: 'circle',
            lineColor: 'white',
            lineWidth: markerLineWidth, // Custom or default marker line width
          },
        },
      },
      series: [
        {
          data: data.slice(Math.max(data.length - 4, 0), data.length),
          type: 'line',
          zones: zones,
          lineWidth: 2,
          states: {
            hover: {
              enabled: false,
            },
          },
          threshold: null,
        },
      ],
    };
  }, [data, zones, plotBands, min, max, height, markerRadius, markerLineWidth]);

  return <HighchartsReact highcharts={Highcharts} options={options} />;
});

SparkLineChartGraph.displayName = 'SparkLineChartGraph';
