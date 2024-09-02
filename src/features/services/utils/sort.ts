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
  'Superpower Blood Panel',
  'Custom Blood Panel',
  '1-1 Advisory Call',
];
