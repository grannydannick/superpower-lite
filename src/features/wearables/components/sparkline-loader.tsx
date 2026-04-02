import { memo } from 'react';
import { InView } from 'react-intersection-observer';

import { WearablesSparkline } from '@/components/ui/charts/wearables-sparkline/wearables-sparkline';

import { useWearablesTimeseries } from '../api/get-wearables-timeseries';
import type { WearableMetric } from '../const/wearable-metrics';

export function SparklineLoader({ metric }: { metric: WearableMetric }) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const { data, isLoading } = useWearablesTimeseries({
    params: { resource: metric.resource, startDate, endDate },
  });

  return (
    <WearablesSparkline
      items={data?.items ?? []}
      metric={metric}
      isLoading={isLoading}
    />
  );
}

export const LazySparkline = memo(function LazySparkline({
  metric,
  className,
  placeholderHeight = 'h-[52px]',
}: {
  metric: WearableMetric;
  className?: string;
  placeholderHeight?: string;
}) {
  return (
    <InView triggerOnce rootMargin="200px">
      {({ ref, inView }) => (
        <div ref={ref} className={className}>
          {inView ? (
            <SparklineLoader metric={metric} />
          ) : (
            <div className={placeholderHeight} />
          )}
        </div>
      )}
    </InView>
  );
});
