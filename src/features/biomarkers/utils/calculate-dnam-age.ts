import { Biomarker } from '@/types/api';
import { yearsSinceDate } from '@/utils/format';

import { COEFFICIENTS } from '../const/coefficients';

import { calculateAgeCoefficient } from './calculate-age-coefficient';
import { estimateDNAmAge } from './estimate-dnam-age';
import { mortalityScore } from './mortality-score';
import { mostRecent } from './most-recent-biomarker';
import { phenotypicalAge } from './phenotypical-age';

export function calculateDNAmAge(
  biomarkers: Biomarker[],
  birthDate?: string,
): number | null {
  let weightedSum = 0;
  const coreObservations: Map<string, number> = new Map<string, number>();

  // Columns B-J
  for (const name of Object.keys(COEFFICIENTS)) {
    const biomarker = biomarkers.find((b) => b.name === name);
    const calc = COEFFICIENTS[name].calculateCoefficient;
    const value = mostRecent(biomarker?.value || []);

    if (!biomarker || !value) {
      console.warn('Missing biomarker for calculation of bioage: ' + name);
      return null;
    } else {
      coreObservations.set(name, calc(value.quantity.value));
    }
  }

  coreObservations.forEach((obs: any) => {
    weightedSum += obs;
  });

  // Column K (age)
  if (!birthDate) {
    console.error('missing birthdate');
    return null;
  }

  const ageInYears = yearsSinceDate(birthDate, false);
  const ageCoeff = calculateAgeCoefficient(ageInYears);
  weightedSum += ageCoeff;

  // Cell b15
  const b0 = -19.9067;

  // Results (row 17)
  const linComb = weightedSum + b0;
  const mortScore = mortalityScore(linComb);
  const ptypicAge = phenotypicalAge(mortScore);
  const estDNAmAge = estimateDNAmAge(ptypicAge) + 7;
  return parseFloat(estDNAmAge.toFixed(1)); // round to 2 decimal places
}
