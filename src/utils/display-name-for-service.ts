import { CUSTOM_BLOOD_PANEL } from '@/const';
import { HealthcareService } from '@/types/api';

const DISPLAY_NAME_MAP = {
  [CUSTOM_BLOOD_PANEL]: 'Specialty Blood Panel',
};

// WC: 2025-10-15 - This is a temporary function to display the custom display name for the service.
// THIS IS AN UGLY HACK AND SHOULD BE REMOVED ASAP.
export const customDisplayNameForService = (service: HealthcareService) => {
  const serviceName = service.name as keyof typeof DISPLAY_NAME_MAP;
  return DISPLAY_NAME_MAP[serviceName] || service.name;
};
