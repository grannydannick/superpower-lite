import { CollectionMethodType } from '@/types/api';

export const getCollectionInstructions = (
  collectionMethod: CollectionMethodType | null,
) => {
  switch (collectionMethod) {
    case 'AT_HOME':
    case 'PHLEBOTOMY_KIT':
      return `An appointment takes about 15 minutes, and your nurse will arrive during the selected time slot. We recommend booking within 2 hours of waking up.`;
    case 'IN_LAB':
      return `An appointment takes about 15 minutes. We recommend booking within 2 hours of waking up for the most accurate measurement of blood hormone levels.`;
    default:
      return ``;
  }
};
