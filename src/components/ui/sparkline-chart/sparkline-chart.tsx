import React from 'react';

import { cn } from '@/lib/utils';

import { SparkLineChartGraph } from './sparkline-chart-graph';
import { SparkLineChartLegend } from './sparkline-chart-legend';

export const SparkLineChart = (props: any) => {
  const height = props.height || 80; // Default to 80px if no height is provided

  return (
    <div
      className={cn(
        'ml-auto flex w-full max-w-[110px] gap-1 xs:max-w-[170px] lg:max-w-[200px]',
        props.className,
      )}
      style={{
        height: `${height}px`, // Apply dynamic height
        WebkitMask:
          'linear-gradient(90deg, rgba(0,0,0,0) 20%, rgba(0,0,0,1) 30%)',
      }}
    >
      <SparkLineChartGraph {...props} />
      <SparkLineChartLegend {...props} />
    </div>
  );
};
