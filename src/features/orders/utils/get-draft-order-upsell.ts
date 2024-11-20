import { CollectionMethodType, HealthcareService, Order } from '@/types/api';

export const getDraftOrderUpsell = (
  collectionMethod: CollectionMethodType | null,
  draftOrder?: Order,
  service?: HealthcareService,
) => {
  if (!draftOrder || !service) return undefined;

  // if collection method is null then we should not upsell
  if (!collectionMethod) {
    return 0;
  }

  if (draftOrder.method.length > 0) {
    const draftOrderCollectionMethod = draftOrder.method[0];
    // if collection method is "AT_HOME" but current collection method is "IN_LAB" then we should upsell
    if (
      collectionMethod === 'AT_HOME' &&
      draftOrderCollectionMethod === 'IN_LAB'
    ) {
      // TODO: this is bad, we need to pull this directly from server
      return 7900;
    }
  }

  // otherwise we should not upsell
  return 0;
};
