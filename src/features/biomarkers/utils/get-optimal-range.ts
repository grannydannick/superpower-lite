import { Biomarker } from '@/types/api';

export const getOptimalRange = (biomarker: Biomarker): string => {
  const range = biomarker.range;
  const optimalRange = range.find((r) => r.status === 'OPTIMAL');

  if (!optimalRange) {
    console.error(`No optimal range found for ${biomarker.name}`);
  }

  const low = optimalRange?.low;
  const high = optimalRange?.high;

  if (low && high) {
    return `${low.value} - ${high.value}`;
  } else if (!low && high) {
    return `< ${high.value}`;
  } else if (low && !high) {
    return `> ${low.value}`;
  } else {
    return '';
  }
};
