import { HealthcareService } from '@/types/api';

export const customSort = (
  a: HealthcareService,
  b: HealthcareService,
): number => {
  const indexOfA = healthcareServicesOrder.indexOf(a.name);
  const indexOfB = healthcareServicesOrder.indexOf(b.name);

  if (indexOfA === -1 && indexOfB === -1) {
    return Number(b.active) - Number(a.active);
  }

  // might not need case when not found, hopefully should match 1-1 with server data
  return indexOfA === -1 || indexOfB === -1
    ? indexOfB - indexOfA
    : indexOfA - indexOfB;
};

export const healthcareServicesOrder = [
  '1-1 Advisory Call',
  'Superpower Blood Panel',
  'Advanced Blood Panel',
  'Custom Blood Panel',
  'Gut Microbiome Analysis',
  'Environmental Toxins',
  'Grail Galleri Multi Cancer Test',
  'Continuous Glucose Monitor',
  'Full Body MRI',
];
