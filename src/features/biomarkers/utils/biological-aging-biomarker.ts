import { calculateDNAmAge } from '@/features/biomarkers/utils/calculate-dnam-age';
import { Biomarker, BiomarkerResult } from '@/types/api';
import { yearsSinceDate } from '@/utils/format';

import { getBiologicalAgeTimestamps } from './get-biological-age-timestamps';
import { mostRecent } from './most-recent-biomarker';

export const biologicalAgeBiomarker = (
  biomarkers: Biomarker[],
  dateOfBirth: string,
): Biomarker => {
  const timestamps = getBiologicalAgeTimestamps(biomarkers);

  const bioAgeResults: BiomarkerResult[] = [];
  const ageInYears = yearsSinceDate(dateOfBirth, false);

  timestamps.forEach((timestamp) => {
    const age = calculateDNAmAge(biomarkers, dateOfBirth, timestamp);
    if (age !== null) {
      bioAgeResults.push({
        quantity: {
          value: age,
          comparator: 'EQUALS',
          unit: 'yrs',
        },
        status: age < ageInYears ? 'OPTIMAL' : 'HIGH',
        timestamp,
      });
    }
  });

  const latestResult = mostRecent(bioAgeResults);

  return {
    id: 'biological-age',
    name: 'Biological Age',
    favorite: false,
    description: `Not all ages are equal: Your chronological age, or calendar age, reflects how many years you have lived, while your biological age aims to reflect how your body is aging on a cellular level relative to other people. 

Your biological age is affected by many different factors, including diet, sleep, stress, exercise, social relationships, location, genetics, illness, and lifestyle decisions, which means that to some degree, you may be able to improve it over time with appropriate changes. 

There are many different ways to measure biological age, such as with epigenetics, telomere length, and blood biomarkers.

Superpower uses your blood biomarker data. We run select blood biomarkers known to be strongly associated with aging through an open-source, peer-reviewed biological clock algorithm called PhenoAge by Yale Scientist Morgan Levine, PHD, based on 9,926 subjects of normally distributed age (see 'Sources'). 

These subjects were followed for 23 years to see who had died or developed cardiovascular disease, cancer, dementia, diabetes, etc. Levine's team found that their algorithm correlated highly with chronological age (r=0.9) but also predicted all-cause mortality and death from specific diseases better than chronological age alone.

The following nine biomarkers are used to calculate PhenoAge: albumin, creatinine, glucose, c-reactive protein, lymphocyte percent Immune, mean cell volume (MCV), red cell distribution width (RDW), alkaline phosphatase, and white blood cell count.

Biological age has become a popular term in the last few years, as more people become attuned to the concept of longevity and the understanding that we have a certain degree of control over it. 

However, it is important to recognize that biological age is not a discrete predictor of morbidity or mortality events. Meaning, it can’t tell you exactly how long you will live or whether or not you will develop a disease. 

Rather, think of it as a directional measurement of how your body may be aging internally, that is relative to you––i.e., the changes in your biological age over time reflect a general trend (of aging better or worse, or holding steady) and can alert you to lifestyle changes you may want to make to support healthy aging.`,
    importance: '',
    category: 'Aging',
    value: bioAgeResults,
    range: [
      {
        status: 'OPTIMAL',
        high: {
          value: Number(ageInYears.toFixed(2)),
          comparator: 'LESS_THAN_EQUALS',
        },
        low: {
          value: 0,
          comparator: 'GREATER_THAN_EQUALS',
        },
      },
    ],
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
    status: latestResult
      ? latestResult.status === 'OPTIMAL'
        ? 'OPTIMAL'
        : 'HIGH'
      : 'PENDING',
  };
};
