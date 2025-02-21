import { calculateDNAmAge } from '@/features/biomarkers/utils/calculate-dnam-age';
import { Biomarker, BiomarkerResult } from '@/types/api';
import { yearsSinceDate } from '@/utils/format';

import { getBiologicalAgeTimestamps } from './get-biological-age-timestamps';
import { mostRecent } from './most-recent-biomarker';

export const paceOfAgingBiomarker = (
  biomarkers: Biomarker[],
  dateOfBirth: string,
): Biomarker => {
  const timestamps = getBiologicalAgeTimestamps(biomarkers);

  const paceResults: BiomarkerResult[] = [];
  const ageInYears = Math.round(yearsSinceDate(dateOfBirth, false));

  timestamps.forEach((timestamp) => {
    const age = calculateDNAmAge(biomarkers, dateOfBirth, timestamp);
    if (age !== null) {
      const paceOfAging = Math.floor((age / ageInYears) * 100);
      paceResults.push({
        quantity: {
          value: paceOfAging,
          comparator: 'EQUALS',
          unit: '%',
        },
        status: paceOfAging < 100 ? 'OPTIMAL' : 'HIGH',
        timestamp,
      });
    }
  });

  if (paceResults.length === 0) {
    return {
      id: 'pace-of-aging',
      name: 'Pace of Aging',
      favorite: false,
      description:
        'Your Rate of Aging could not be calculated due to missing or incomplete data.',
      importance: '',
      category: 'Aging',
      value: [],
      range: [
        {
          status: 'OPTIMAL',
          high: {
            value: 100,
            comparator: 'LESS_THAN_EQUALS',
          },
          low: {
            value: 0,
            comparator: 'GREATER_THAN_EQUALS',
          },
        },
      ],
      unit: '%',
      metadata: {
        content: [],
        source: [],
      },
      status: 'PENDING',
    };
  }

  const latestResult = mostRecent(paceResults);

  return {
    id: 'pace-of-aging',
    name: 'Pace of Aging',
    favorite: false,
    description:
      'Your Rate of Aging is a personalized measure of the pace at which your body has aged for every year you’ve been alive. Your rate of aging is calculated by dividing your biological age by your chronological age. While biological age and chronological age appear as whole numbers in your report by convention, your rate of aging is calculated with decimal versions of your biological and chronological ages (up to two decimal places) for the most precise output.',
    importance: '',
    category: 'Aging',
    value: paceResults,
    range: [
      {
        status: 'OPTIMAL',
        high: {
          value: 100,
          comparator: 'LESS_THAN_EQUALS',
        },
        low: {
          value: 0,
          comparator: 'GREATER_THAN_EQUALS',
        },
      },
    ],
    unit: '%',
    metadata: {
      content: [],
      source: [],
    },
    status: latestResult
      ? latestResult.status === 'OPTIMAL'
        ? 'OPTIMAL'
        : 'HIGH'
      : 'PENDING',
  };
};
