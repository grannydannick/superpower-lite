import { Meta } from '@storybook/react';
import React from 'react';

import { Biomarker } from '@/types/api';

import { SparklineChart } from './sparkline-chart';

export default {
  title: 'superpower/sparkline-chart',
  component: SparklineChart,
} as Meta;

const baseBiomarker: Biomarker = {
  id: 'test-biomarker-1',
  name: 'Test Biomarker',
  description: 'A test biomarker for sparkline chart',
  importance: 'high',
  status: 'NORMAL' as const,
  category: 'metabolism',
  unit: 'mg/dL',
  favorite: false,
  metadata: {
    source: [],
    content: [],
  },
  recommendedTests: {
    rx: [],
    services: [],
  },
  value: [],
  ranges: {
    custom: [],
    quest: [
      {
        low: { value: 21 },
        high: { value: 100 },
        status: 'OPTIMAL' as const,
      },
    ],
    labcorp: [
      {
        low: { value: 21 },
        high: { value: 100 },
        status: 'OPTIMAL' as const,
      },
    ],
    bioref: [
      {
        low: { value: 21 },
        high: { value: 100 },
        status: 'OPTIMAL' as const,
      },
    ],
  },
};

const optimalBoundedBiomarker: Biomarker = {
  ...baseBiomarker,
  ranges: {
    custom: [],
    quest: [
      {
        low: { value: 21 },
        high: { value: 100 },
        status: 'OPTIMAL' as const,
      },
    ],
    labcorp: [
      {
        low: { value: 21 },
        high: { value: 100 },
        status: 'OPTIMAL' as const,
      },
    ],
    bioref: [
      {
        low: { value: 21 },
        high: { value: 100 },
        status: 'OPTIMAL' as const,
      },
    ],
  },
  value: [
    {
      id: '1',
      quantity: { value: 10, comparator: 'EQUALS' as const },
      timestamp: '2024-01-01',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: { value: 20, comparator: 'EQUALS' as const },
      timestamp: '2024-01-02',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: { value: 30, comparator: 'EQUALS' as const },
      timestamp: '2024-01-03',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '4',
      quantity: { value: 40, comparator: 'EQUALS' as const },
      timestamp: '2024-01-04',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '5',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-05',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '6',
      quantity: { value: 100, comparator: 'EQUALS' as const },
      timestamp: '2024-01-06',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '7',
      quantity: { value: 0, comparator: 'EQUALS' as const },
      timestamp: '2024-01-07',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '8',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-08',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
  ],
};

export const OptimalBounded = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <SparklineChart biomarker={optimalBoundedBiomarker} />
    </div>
  );
};

const singleOptimalUnboundedUpperBiomarker: Biomarker = {
  ...baseBiomarker,
  ranges: {
    quest: [
      {
        low: { value: 21 },
        status: 'OPTIMAL' as const,
      },
    ],
    custom: [],
    labcorp: [
      {
        low: { value: 21 },
        status: 'OPTIMAL' as const,
      },
    ],
    bioref: [
      {
        low: { value: 21 },
        status: 'OPTIMAL' as const,
      },
    ],
  },
  value: [
    {
      id: '1',
      quantity: { value: 20, comparator: 'EQUALS' as const },
      timestamp: '2024-01-02',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
  ],
};

export const SingleOptimalUnboundedUpper = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <SparklineChart biomarker={singleOptimalUnboundedUpperBiomarker} />
    </div>
  );
};

const doubleOptimalUnboundedUpperBiomarker: Biomarker = {
  ...baseBiomarker,
  ranges: {
    quest: [
      {
        low: { value: 21 },
        status: 'OPTIMAL' as const,
      },
    ],
    labcorp: [
      {
        low: { value: 21 },
        status: 'OPTIMAL' as const,
      },
    ],
    bioref: [
      {
        low: { value: 21 },
        status: 'OPTIMAL' as const,
      },
    ],
    custom: [],
  },
  value: [
    {
      id: '1',
      quantity: { value: 10, comparator: 'EQUALS' as const },
      timestamp: '2024-01-01',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: { value: 20, comparator: 'EQUALS' as const },
      timestamp: '2024-01-02',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: { value: 30, comparator: 'EQUALS' as const },
      timestamp: '2024-01-03',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
  ],
};

export const DoubleOptimalUnboundedUpper = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <SparklineChart biomarker={doubleOptimalUnboundedUpperBiomarker} />
    </div>
  );
};

const optimalUnboundedUpperBiomarker: Biomarker = {
  ...baseBiomarker,
  ranges: {
    quest: [
      {
        low: { value: 21 },
        status: 'OPTIMAL' as const,
      },
    ],
    labcorp: [
      {
        low: { value: 21 },
        status: 'OPTIMAL' as const,
      },
    ],
    bioref: [
      {
        low: { value: 21 },
        status: 'OPTIMAL' as const,
      },
    ],
    custom: [],
  },
  value: [
    {
      id: '1',
      quantity: { value: 10, comparator: 'EQUALS' as const },
      timestamp: '2024-01-01',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: { value: 20, comparator: 'EQUALS' as const },
      timestamp: '2024-01-02',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: { value: 30, comparator: 'EQUALS' as const },
      timestamp: '2024-01-03',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '4',
      quantity: { value: 40, comparator: 'EQUALS' as const },
      timestamp: '2024-01-04',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '5',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-05',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '6',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-06',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '7',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-07',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '8',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-08',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '9',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-09',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '10',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-10',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
  ],
};

export const OptimalUnboundedUpper = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <SparklineChart biomarker={optimalUnboundedUpperBiomarker} />
    </div>
  );
};

const optimalUnboundedLowerBiomarker: Biomarker = {
  ...baseBiomarker,
  ranges: {
    custom: [],
    quest: [
      {
        high: { value: 100 },
        status: 'OPTIMAL' as const,
      },
    ],
    labcorp: [
      {
        high: { value: 100 },
        status: 'OPTIMAL' as const,
      },
    ],
    bioref: [
      {
        high: { value: 100 },
        status: 'OPTIMAL' as const,
      },
    ],
  },
  value: [
    {
      id: '1',
      quantity: { value: 10, comparator: 'EQUALS' as const },
      timestamp: '2024-01-01',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: { value: 20, comparator: 'EQUALS' as const },
      timestamp: '2024-01-02',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: { value: 30, comparator: 'EQUALS' as const },
      timestamp: '2024-01-03',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '4',
      quantity: { value: 40, comparator: 'EQUALS' as const },
      timestamp: '2024-01-04',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '5',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-05',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '6',
      quantity: { value: 100, comparator: 'EQUALS' as const },
      timestamp: '2024-01-06',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '7',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-07',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '8',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-08',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '9',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-09',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '10',
      quantity: { value: 40, comparator: 'EQUALS' as const },
      timestamp: '2024-01-10',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
  ],
};

export const OptimalUnboundedLower = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <SparklineChart biomarker={optimalUnboundedLowerBiomarker} />
    </div>
  );
};

const optimalAndNormalBoundedBiomarker: Biomarker = {
  ...baseBiomarker,
  ranges: {
    quest: [
      {
        low: { value: 21 },
        high: { value: 100 },
        status: 'NORMAL' as const,
      },
      {
        low: { value: 40 },
        high: { value: 80 },
        status: 'OPTIMAL' as const,
      },
    ],
    labcorp: [
      {
        low: { value: 21 },
        high: { value: 100 },
        status: 'NORMAL' as const,
      },
      {
        low: { value: 40 },
        high: { value: 80 },
        status: 'OPTIMAL' as const,
      },
    ],
    custom: [],
    bioref: [
      {
        low: { value: 21 },
        high: { value: 100 },
        status: 'NORMAL' as const,
      },
      {
        low: { value: 40 },
        high: { value: 80 },
        status: 'OPTIMAL' as const,
      },
    ],
  },
  value: [
    {
      id: '1',
      quantity: { value: 10, comparator: 'EQUALS' as const },
      timestamp: '2024-01-01',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: { value: 20, comparator: 'EQUALS' as const },
      timestamp: '2024-01-02',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: { value: 30, comparator: 'EQUALS' as const },
      timestamp: '2024-01-03',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '4',
      quantity: { value: 40, comparator: 'EQUALS' as const },
      timestamp: '2024-01-04',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '5',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-05',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '6',
      quantity: { value: 100, comparator: 'EQUALS' as const },
      timestamp: '2024-01-06',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '7',
      quantity: { value: 0, comparator: 'EQUALS' as const },
      timestamp: '2024-01-07',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '8',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-08',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
  ],
};

export const OptimalAndNormalBounded = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <SparklineChart biomarker={optimalAndNormalBoundedBiomarker} />
    </div>
  );
};

const optimalAndNormalUnboundedUpperBiomarker: Biomarker = {
  ...baseBiomarker,
  ranges: {
    quest: [
      {
        low: { value: 21 },
        status: 'NORMAL' as const,
      },
      {
        low: { value: 40 },
        status: 'OPTIMAL' as const,
      },
    ],
    labcorp: [
      {
        low: { value: 21 },
        status: 'NORMAL' as const,
      },
      {
        low: { value: 40 },
        status: 'OPTIMAL' as const,
      },
    ],
    bioref: [
      {
        low: { value: 21 },
        status: 'NORMAL' as const,
      },
      {
        low: { value: 40 },
        status: 'OPTIMAL' as const,
      },
    ],
    custom: [],
  },
  value: [
    {
      id: '1',
      quantity: { value: 10, comparator: 'EQUALS' as const },
      timestamp: '2024-01-01',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: { value: 20, comparator: 'EQUALS' as const },
      timestamp: '2024-01-02',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: { value: 30, comparator: 'EQUALS' as const },
      timestamp: '2024-01-03',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '4',
      quantity: { value: 40, comparator: 'EQUALS' as const },
      timestamp: '2024-01-04',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '5',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-05',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '6',
      quantity: { value: 100, comparator: 'EQUALS' as const },
      timestamp: '2024-01-06',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '7',
      quantity: { value: 0, comparator: 'EQUALS' as const },
      timestamp: '2024-01-07',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '8',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-08',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
  ],
};

export const OptimalAndNormalUnboundedUpper = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <SparklineChart biomarker={optimalAndNormalUnboundedUpperBiomarker} />
    </div>
  );
};

const optimalAndNormalUnboundedLowerBiomarker: Biomarker = {
  ...baseBiomarker,
  ranges: {
    custom: [],
    quest: [
      {
        high: { value: 100 },
        status: 'NORMAL' as const,
      },
      {
        high: { value: 80 },
        status: 'OPTIMAL' as const,
      },
    ],
    labcorp: [
      {
        high: { value: 100 },
        status: 'NORMAL' as const,
      },
      {
        high: { value: 80 },
        status: 'OPTIMAL' as const,
      },
    ],
    bioref: [
      {
        high: { value: 100 },
        status: 'NORMAL' as const,
      },
      {
        high: { value: 80 },
        status: 'OPTIMAL' as const,
      },
    ],
  },
  value: [
    {
      id: '1',
      quantity: { value: 10, comparator: 'EQUALS' as const },
      timestamp: '2024-01-01',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: { value: 20, comparator: 'EQUALS' as const },
      timestamp: '2024-01-02',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: { value: 30, comparator: 'EQUALS' as const },
      timestamp: '2024-01-03',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '4',
      quantity: { value: 40, comparator: 'EQUALS' as const },
      timestamp: '2024-01-04',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '5',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-05',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '6',
      quantity: { value: 100, comparator: 'EQUALS' as const },
      timestamp: '2024-01-06',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '7',
      quantity: { value: 0, comparator: 'EQUALS' as const },
      timestamp: '2024-01-07',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '8',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-08',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
  ],
};

export const OptimalAndNormalUnboundedLower = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <SparklineChart biomarker={optimalAndNormalUnboundedLowerBiomarker} />
    </div>
  );
};

// Example with different sources to showcase dynamic range selection
const multiSourceBiomarker: Biomarker = {
  ...baseBiomarker,
  ranges: {
    quest: [
      {
        low: { value: 20 },
        high: { value: 80 },
        status: 'OPTIMAL' as const,
      },
    ],
    labcorp: [
      {
        low: { value: 25 },
        high: { value: 85 },
        status: 'OPTIMAL' as const,
      },
    ],
    custom: [],
    bioref: [
      {
        low: { value: 22 },
        high: { value: 82 },
        status: 'OPTIMAL' as const,
      },
    ],
  },
  value: [
    {
      id: '1',
      quantity: { value: 30, comparator: 'EQUALS' as const },
      timestamp: '2024-01-01',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: { value: 40, comparator: 'EQUALS' as const },
      timestamp: '2024-01-02',
      source: 'quest' as const,
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: { value: 50, comparator: 'EQUALS' as const },
      timestamp: '2024-01-03',
      source: 'labcorp' as const, // Last value from labcorp, so will use labcorp ranges
      component: [],
      orderIds: [],
    },
  ],
};

export const MultiSourceDynamicRanges = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <SparklineChart biomarker={multiSourceBiomarker} />
    </div>
  );
};
