import { BiomarkerResult } from '@/types/api';
import { getDisplayComparator } from '@/utils/get-display-comparator';

import { ChartPoint } from '../types/chart';

export function toChartPoint(result: BiomarkerResult): ChartPoint {
  return {
    x: new Date(result.timestamp).getTime(),
    y: result.quantity.value,
    comparator: getDisplayComparator(result.quantity.comparator),
    isPlaceholder: false,
  };
}
