import Highcharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more.js';
import highchartsItems from 'highcharts/modules/item-series.js';
import { HighchartsReact } from 'highcharts-react-official';
import moment from 'moment';
import React from 'react';

import { Biomarker, Range } from '@/types/api';
import { ChartPoint } from '@/types/charts';

import {
  toChartPoint,
  calculateYMin,
  calculateYMax,
  toChartPlotLines,
  toChartPlotBands,
} from './utils';

if (typeof Highcharts === 'object') {
  highchartsMore(Highcharts);
  highchartsItems(Highcharts);
}

export type TimeSeriesChartProps = {
  biomarker: Biomarker;
};

export enum ChartColor {
  GREY = '#EDEEF1',
  GREEN = '#11C182',
  YELLOW = '#D7DB0E',
  RED = '#FF68DE',
}

export enum PlotBandColor {
  GREY = '#71717A',
  WHITE = '#FFFFFF',
  BLACK = '#000000',
}

/*
 * This component is real mess and needs to be reengineered from zero
 *
 * We are still using it because we don't have a lot of time for refactor
 * */
export function TimeSeriesChart({
  biomarker,
}: TimeSeriesChartProps): JSX.Element {
  const { range, value } = biomarker;

  let data = value.map(toChartPoint);

  const min = calculateYMin(value, range);
  const max = calculateYMax(value, range);

  const normalRange: Range | undefined = biomarker.range.find(
    (range: Range) => {
      return range.status.toUpperCase() === 'NORMAL';
    },
  );
  const optimalRange: Range | undefined = biomarker.range.find(
    (range: Range) => {
      return range.status.toUpperCase() === 'OPTIMAL';
    },
  );

  let softMin = -Infinity;
  let softMax = Infinity;

  softMin = Math.min(
    normalRange?.low?.value ?? Infinity,
    optimalRange?.low?.value ?? Infinity,
  );
  softMax = Math.max(
    normalRange?.high?.value ?? -Infinity,
    optimalRange?.low && !optimalRange?.high
      ? Infinity
      : optimalRange?.high?.value ?? -Infinity,
  );
  if (!isFinite(softMin)) softMin = -Infinity;
  if (!isFinite(softMax)) softMax = Infinity;

  const plotLines = toChartPlotLines(range);
  const plotBands = toChartPlotBands(range);

  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const placeholderData: ChartPoint[] = [
    { y: null as any, x: today.getTime() },
    { y: null as any, x: lastWeek.getTime() },
  ];

  data = data.length ? data : placeholderData;

  data.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
  if (data.length === 1) {
    const laterDate = new Date(data[0].x);
    laterDate.setMonth(laterDate.getMonth() + 6);
    data.push({
      ...data[0],
      x: laterDate.getTime(),
      placeholder: true,
    });
  }

  const orderedDates = data.map((pt) => pt.x);
  const showsFuturePoint = data.find((pt) => pt.placeholder);

  // map the data into points formatted for
  const seriesData = data.map((pt: ChartPoint, i) => ({
    x: i,
    y: pt.y,
    date: new Date(pt.x).toISOString().split('T')[0],
    marker: pt.placeholder ? { fillColor: '#c6c6c6' } : undefined,
  }));

  let mainSeriesData = seriesData;
  let lastSegmentData: ChartPoint[] = [];
  if (showsFuturePoint) {
    // Create two series: one for all points except the last segment, and one for the last segment
    mainSeriesData = seriesData.slice(0, -1);
    lastSegmentData = seriesData.slice(-2);
  }

  const options: Highcharts.Options = {
    chart: {
      backgroundColor: undefined,
      borderWidth: 0,
      // position: 'inherit',
      type: 'line',
      height: 400,
      // skipClone: true,
      spacing: [0, 0, 0, 0],
      events: {
        render: () => {
          // this is an awful hack to create the y-axis
          // 1. we create horizontal bands (see plotBands.concat above)
          // 2. select the svg <path/> dom elements
          // 3. manually mutate the rectangles to be just lines
          // (if you comment out this useEffect you'll see what it's doing)
          const bands = document.getElementsByClassName(
            'y-axis-hack',
          ) as HTMLCollectionOf<SVGPathElement>;
          for (const band of bands) {
            // convert to vertical line
            const d = band.attributes.getNamedItem('d');
            const path = d?.value;
            if (path) {
              // svg path drawn values, example: M 35 81.5 L 534 81.5 L 534 0.5 L 35 0.5 Z
              const commands = path.split(' ');
              const left = commands[1];
              commands[4] = (Number(left) + 2).toString();
              commands[7] = (Number(left) + 2).toString();
              d.value = commands.join(' ');
              // band.attributes.setNamedItem(d)
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
      tickPixelInterval: 110,
      type: 'category',
      labels: {
        enabled: !!data.length,
        formatter: function (this: any) {
          return `<div style="text-align: center;"><span style="color: #71717A; font-size: 18px;">${moment(
            orderedDates[this.value], // to display how we want, the x value is the array index (not the date itself)
          ).format(
            'MMM DD',
          )}</span><br /><span style="color: #A1A1AA; font-size: 14px;">${moment(
            orderedDates[this.value],
          ).format('YYYY')}</span></div>`;
        },
        useHTML: true,
        style: {
          color: PlotBandColor.BLACK,
          fontSize: '14px',
          opacity: 0.4,
        },
      },
      ordinal: false,
      tickmarkPlacement: 'on',
      // gridLineDashStyle: 'Dot',
      // gridLineWidth: 1,
      // gridLineColor: PlotBandColor.GREY,
      lineWidth: 0,
      lineColor: 'rgb(0,0,0,0.5)',
      gridZIndex: 0,
    },
    yAxis: {
      visible: true,
      min,
      max,
      endOnTick: false,
      startOnTick: false,
      labels: {
        enabled: false,
        // style: {
        //   color: dark ? PlotBandColor.WHITE : PlotBandColor.BLACK,
        //   fontSize: '12px',
        //   opacity: 0.5,
        //   lineWidth: 0,
        // },
      },
      title: {
        text: undefined,
        style: {
          color: 'black',
        },
      },
      lineWidth: 0,
      lineColor: 'rgb(0,0,0,0.5)',
      gridLineWidth: 0,
      minorGridLineWidth: 0,
      plotLines: plotLines.concat([
        {
          color: ChartColor.GREY,
          // '#E4E4E7', // Color value
          dashStyle: 'Dash', // Style of the plot line. Default to solid
          value: isFinite(min) ? min : 0, // Value of where the line will appear
          width: 1, // Width of the line
          zIndex: 5,
        },
      ]),
      plotBands: plotBands.concat([
        {
          from: -Infinity,
          to: softMin,
          color: ChartColor.RED,
          className: 'y-axis-hack',
        },
        {
          from:
            optimalRange?.low?.value !== undefined
              ? optimalRange?.low?.value
              : -Infinity,
          to:
            optimalRange?.high?.value !== undefined
              ? optimalRange?.high?.value
              : Infinity,
          color: ChartColor.GREEN,
          className: 'y-axis-hack',
        },
        {
          from: softMin,
          to: optimalRange?.low?.value,
          color: ChartColor.YELLOW,
          className: 'y-axis-hack',
        },
        {
          from: optimalRange?.high?.value,
          to: softMax,
          color: ChartColor.YELLOW,
          className: 'y-axis-hack',
        },
        {
          from: softMax,
          to: Infinity,
          color: ChartColor.RED,
          className: 'y-axis-hack',
        },
      ]),
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        lineWidth: 6,
        dashStyle: showsFuturePoint ? 'Dash' : undefined,
        shadow: false,
        // lineColor: 'silver',
        marker: {
          radius: 8,
          symbol: 'circle',
          lineColor: 'white',
          lineWidth: 4,
          states: {
            hover: {
              lineWidth: 8,
              lineColor: 'green',
            },
          },
          // borderRadius: 4,
        },
        dataLabels: {
          enabled: true,
          padding: 14,
          // You can customize data label properties here
          formatter: function (this) {
            if (
              showsFuturePoint &&
              this.key?.toString() === (seriesData.length - 1).toString()
            )
              return '';

            return `<span>${this.y?.toString().split('.')[0]}</span><span style="color: grey;">.${
              this.y?.toString().split('.')[1] || '0'
            }</span>`;
          },
          useHTML: true,
          // format: '{y}', // Display the Y-axis value as the label
          style: {
            color: 'black',
            fontSize: '14px',
            fontWeight: '500',
          },
        },
        borderColor: 'white',
        borderWidth: 4,
        // fillOpacity: 0.25,
      },
    },
    tooltip: {
      enabled: false,
    },
    series: [
      // Last segment series in grey (with all hover effects disabled)
      {
        data: showsFuturePoint ? lastSegmentData : [],
        color: '#C6C6C6',
        lineWidth: 3,
        enableMouseTracking: false,
        stickyTracking: false,
        states: {
          hover: {
            enabled: false,
          },
          inactive: {
            opacity: 1,
          },
        },
        marker: {
          states: {
            hover: {
              enabled: false,
            },
            select: {
              enabled: false,
            },
          },
        },
        threshold: null,
        type: 'line',
        zIndex: 1,
      },
      // Main series with colored zones
      {
        data: mainSeriesData,
        zIndex: 2,
        zones: [
          {
            value: softMin,
            color: isFinite(softMin) ? ChartColor.RED : ChartColor.GREY,
          },
          normalRange?.low?.value &&
          optimalRange?.low?.value &&
          normalRange?.low?.value < optimalRange?.low?.value
            ? {
                value: optimalRange?.low?.value,
                color: ChartColor.YELLOW,
              }
            : undefined,
          {
            value: optimalRange?.high?.value ?? softMax,
            color:
              (optimalRange?.high?.value ?? softMax) !== undefined
                ? ChartColor.GREEN
                : ChartColor.GREY,
          },
          optimalRange?.high?.value
            ? {
                value: softMax,
                color:
                  isFinite(softMin) || isFinite(softMax)
                    ? ChartColor.YELLOW
                    : ChartColor.GREY,
              }
            : undefined,
          {
            color: isFinite(softMax) ? ChartColor.RED : ChartColor.GREY,
          },
        ].filter(
          (z) => z !== undefined,
        ) as Highcharts.SeriesZonesOptionsObject[],
        color: 'silver',
        lineWidth: 3,
        states: {
          hover: {
            enabled: false,
          },
        },
        threshold: null,
        // tooltip: {
        //   // fontFamily: 'Stationery, Helvetica, Arial, sans-serif',
        //   headerFormat: undefined,
        //   pointFormat: `{point.y} ${unit || ''}`,
        // },
        type: 'line',
      },
    ],
  };

  if (showsFuturePoint) {
    options.plotOptions!.series!.dashStyle = 'Dash';
  }

  if (!data.length && (!isFinite(max) || !isFinite(min))) {
    return (
      <div className="flex size-full items-center justify-center bg-white pt-5">
        <p className="text-black opacity-50">No data yet</p>
      </div>
    );
  }
  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
