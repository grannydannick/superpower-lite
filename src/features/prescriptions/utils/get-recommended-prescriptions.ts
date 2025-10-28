import { RECOMMENDED_PRESCRIPTIONS } from '@/const';
import { Rx } from '@/types/api';

export const getRecommendedPrescriptions = (prescriptions: Rx[] = []): Rx[] => {
  if (!prescriptions.length || !RECOMMENDED_PRESCRIPTIONS.length) {
    return [];
  }

  return RECOMMENDED_PRESCRIPTIONS.map((name) =>
    prescriptions.find((prescription) => prescription.name === name),
  ).filter((prescription): prescription is Rx => Boolean(prescription));
};
