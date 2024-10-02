import { ToolbarCategoryType } from '@/features/biomarkers/types/filters';

export const getHealthcareServiceFromCategory = (
  category: ToolbarCategoryType,
): string => {
  switch (category) {
    case 'Allergies':
      return 'Food & Environmental Allergy Testing';
    case 'Blood':
      return 'Superpower Blood Panel';
    case 'Cancer':
      return 'Grail Galleri Multi Cancer Test';
    case 'Gut':
      return 'Gut Microbiome Analysis';
    case 'Glucose':
      return 'Continuous Glucose Monitor';
    case 'DEXA':
      return 'DEXA Scan';
    case 'Genetic':
      return 'Full Genetic Sequencing';
    case 'MRI':
      return 'Full Body MRI';
    case 'Toxins':
      return 'Environmental Toxins';
    case 'VO2 Max':
      return 'VO2 Max Test';
  }
};
