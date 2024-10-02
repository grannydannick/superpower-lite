export const STATUS_OPTIONS = {
  ALL_RANGES: {
    label: 'All Ranges',
    filters: undefined,
    description: 'No range filter',
    fill: 'fill-zinc-200',
    border: 'border-zinc-400',
    background: 'bg-zinc-200',
  },
  OPTIMAL: {
    label: 'Optimal',
    filters: ['OPTIMAL'],
    description: 'Ideal range for peak body function',
    fill: 'fill-green-500',
    border: 'border-green-500',
    background: 'bg-green-500',
  },
  NORMAL: {
    label: 'Normal',
    filters: ['NORMAL'],
    description: 'Borderline suboptimal',
    fill: 'fill-yellow-500',
    border: 'border-yellow-500',
    background: 'bg-yellow-500',
  },
  OUT_OF_RANGE: {
    label: 'Out of Range',
    filters: ['HIGH', 'LOW'],
    description: 'May require further attention',
    fill: 'fill-pink-500',
    border: 'border-pink-500',
    background: 'bg-pink-500',
  },
};
