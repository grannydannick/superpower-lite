import { ToolbarCategoryType } from '@/features/biomarkers/types/filters';

export const CATEGORY_OPTIONS = [
  {
    id: 'aging',
    label: 'Aging',
  },
  {
    id: 'blood-and-oxygen',
    label: 'Blood and Oxygen',
  },
  {
    id: 'cardiometabolic',
    label: 'Cardiometabolic',
  },
  {
    id: 'hormones',
    label: 'Hormones',
  },
  {
    id: 'liver-and-kidney-health',
    label: 'Liver & Kidney Health',
  },
  {
    id: 'nutrition-and-inflammation',
    label: 'Nutrition & Inflammation',
  },
  {
    id: 'toxins',
    label: 'Toxins',
  },
];

export const TOOLBAR_CATEGORIES: { name: ToolbarCategoryType }[] = [
  {
    name: 'Blood',
  },
  {
    name: 'Genetic',
  },
  {
    name: 'Gut',
  },
  {
    name: 'Toxins',
  },
  {
    name: 'Allergies',
  },
  {
    name: 'VO2 Max',
  },
  {
    name: 'Cancer',
  },
  {
    name: 'Glucose',
  },
  {
    name: 'MRI',
  },
  {
    name: 'DEXA',
  },
];
