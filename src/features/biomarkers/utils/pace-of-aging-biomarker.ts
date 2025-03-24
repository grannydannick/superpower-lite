import { calculateDNAmAge } from '@/features/biomarkers/utils/calculate-dnam-age';
import { Biomarker } from '@/types/api';
import { yearsSinceDate } from '@/utils/format';

export const paceOfAgingBiomarker = (
  biomarkers: Biomarker[],
  dateOfBirth: string,
): Biomarker => {
  const age = calculateDNAmAge(biomarkers, dateOfBirth);

  if (age === null) {
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
          },
          low: {
            value: 0,
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

  const ageInYears = Math.round(yearsSinceDate(dateOfBirth, false));
  const paceOfAging = Math.floor((age / ageInYears) * 100);

  return {
    id: 'pace-of-aging',
    name: 'Pace of Aging',
    favorite: false,
    description:
      'Your Rate of Aging is a personalized measure of the pace at which your body has aged for every year you’ve been alive. Your rate of aging is calculated by dividing your biological age by your chronological age. While biological age and chronological age appear as whole numbers in your report by convention, your rate of aging is calculated with decimal versions of your biological and chronological ages (up to two decimal places) for the most precise output.',
    importance: '',
    category: 'Aging',
    value: [
      {
        id: 'pace-of-aging-result',
        quantity: {
          value: paceOfAging,
          comparator: 'EQUALS',
        },
        status: paceOfAging < 100 ? 'OPTIMAL' : 'HIGH',
        timestamp: new Date().toISOString(),
        component: [],
      },
    ],
    range: [
      {
        status: 'OPTIMAL',
        high: {
          value: 100,
        },
        low: {
          value: 0,
        },
      },
    ],
    unit: '%',
    metadata: {
      content: [],
      source: [],
    },
    status: paceOfAging < 100 ? 'OPTIMAL' : 'HIGH',
  };
};
