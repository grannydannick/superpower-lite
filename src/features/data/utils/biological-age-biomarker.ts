import { mostRecent } from '@/features/data/utils/most-recent-biomarker';
import { Biomarker } from '@/types/api';
import { yearsSinceDate } from '@/utils/format';

export const biologicalAgeBiomarker = (
  biomarkers: Biomarker[],
  dateOfBirth: string,
): Biomarker => {
  const age =
    mostRecent(biomarkers.find((b) => b.name == 'Biological Age')?.value ?? [])
      ?.quantity.value ?? null;
  const ageInYears = yearsSinceDate(dateOfBirth);

  return {
    id: 'biological-age',
    name: 'Biological Age',
    favorite: false,
    description: `Your chronological age reflects how many years you've lived, while your biological age reflects how your body is aging at a cellular level. Biological age is influenced by factors like diet, sleep, stress, exercise, and genetics, and can potentially be improved with lifestyle changes.
    Superpower measures biological age using blood biomarkers run through PhenoAge, a peer-reviewed algorithm developed by Yale scientist Morgan Levine, PhD. Based on a 23-year study of nearly 10,000 subjects, PhenoAge was found to predict mortality and disease risk better than chronological age alone, using nine key biomarkers including albumin, glucose, creatinine, and inflammatory markers (see 'Sources').
    However, biological age isn't a precise predictor of how long you'll live or whether you'll develop disease. Instead, think of it as a directional measurement—tracking changes in your biological age over time reveals general trends in how you're aging and can guide lifestyle adjustments to support healthier aging.`,
    importance: '',
    category: 'Aging',
    value: age
      ? [
          {
            id: 'biological-age-result',
            quantity: {
              value: age,
              comparator: 'EQUALS',
              unit: 'yrs',
            },
            status: 'OPTIMAL',
            timestamp: new Date().toISOString(),
            component: [],
            source: 'custom',
          },
        ]
      : [],
    ranges: {
      labcorp: [],
      bioref: [],
      quest: [],
      custom: [
        {
          status: 'OPTIMAL',
          high: {
            value: Number(ageInYears.toFixed(2)),
          },
          low: {
            value: 0,
          },
        },
      ],
    },
    unit: 'yrs',
    metadata: {
      source: [
        {
          text: 'M. Levine, et. al. An epigenetic biomarker of aging for lifespan and healthspan',
          url: 'https://www.aging-us.com/article/101414/text',
        },
      ],
      content: [],
    },
    status: age ? (age < ageInYears ? 'OPTIMAL' : 'HIGH') : 'PENDING',
  };
};
