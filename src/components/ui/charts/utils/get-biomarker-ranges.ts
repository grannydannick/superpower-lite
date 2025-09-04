import { Biomarker, Lab, Range } from '@/types/api';

export interface BiomarkerRangeInfo {
  ranges: Range[];
  lastValue: Biomarker['value'][0] | null;
  lastValueSource: string;
  sortedValues: Biomarker['value'];
}

const PREFERENCE_ORDER = ['quest', 'labcorp', 'bioref', 'custom'] as Lab[];

/**
 * Returns the appropriate recent range for a biomarker based on last value.
 * Implements fallback to next best available range if lastValue source doesn't exist.
 */
export const getBiomarkerRanges = (
  biomarker: Biomarker,
): BiomarkerRangeInfo => {
  const sortedValues = [...biomarker.value].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const lastValue = sortedValues[0] || null;
  const lastValueSource = lastValue?.source || 'quest';

  // Read the last value source
  let ranges =
    biomarker.ranges?.[lastValueSource as keyof typeof biomarker.ranges] || [];

  // Fallback: If no ranges found for lastValue source, fallback to next best available range
  if (ranges.length === 0 && biomarker.ranges) {
    const availableSources = Object.keys(biomarker.ranges) as Array<
      keyof typeof biomarker.ranges
    >;

    for (const source of PREFERENCE_ORDER) {
      if (
        availableSources.includes(source) &&
        biomarker.ranges[source]?.length
      ) {
        ranges = biomarker.ranges[source] || [];
        break;
      }
    }
  }

  return {
    ranges: ranges || [],
    lastValue,
    lastValueSource,
    sortedValues,
  };
};
