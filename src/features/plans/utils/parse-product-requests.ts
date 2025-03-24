import { CarePlanActivity } from '@medplum/fhirtypes';

// Helper to parse product IDs from FHIR activities
export const parseProductRequests = (
  activities: CarePlanActivity[],
): string[] => {
  return activities
    .filter(
      (activity) => activity.detail?.productCodeableConcept?.coding?.[0]?.code,
    )
    .map(
      (activity) =>
        activity.detail?.productCodeableConcept?.coding?.[0]?.code as string,
    );
};
