import { Biomarker } from '@/types/api';

const maleOnlyBiomarkers = [
  'Prostate Specific Antigen (PSA)', // Hormones
  'PSA, Complexed', // Hormones
];

export const filterBiomarkersByGender = (
  biomarkers: Biomarker[],
  gender?: string,
): Biomarker[] => {
  if (gender === 'FEMALE') {
    return biomarkers.filter(
      (biomarker) => !maleOnlyBiomarkers.includes(biomarker.name),
    );
  }
  return biomarkers;
};
