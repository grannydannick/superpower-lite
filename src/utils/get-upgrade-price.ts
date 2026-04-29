import {
  ADVANCED_MICROBIOME_BUNDLE_PRICE,
  ADVANCED_MICROBIOME_BUNDLE_PRICE_NYNJ,
  ADVANCED_UPGRADE_BUNDLE_IDS,
  AdvancedUpgradeBundleId,
  COMPLETE_BUNDLE_PRICE,
  COMPLETE_BUNDLE_PRICE_NYNJ,
  UPGRADE_PRICE,
  UPGRADE_PRICE_NYNJ,
} from '@/const';
import { User } from '@/types/api';

export const isNYNJUser = (user: User | undefined) =>
  user?.primaryAddress?.state === 'NY' || user?.primaryAddress?.state === 'NJ';

export const getUpgradePrice = (
  user: User | undefined,
  bundleId?: AdvancedUpgradeBundleId,
): number => {
  const nynj = isNYNJUser(user);
  switch (bundleId) {
    case ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE:
      return nynj
        ? ADVANCED_MICROBIOME_BUNDLE_PRICE_NYNJ
        : ADVANCED_MICROBIOME_BUNDLE_PRICE;
    case ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE:
      return nynj ? COMPLETE_BUNDLE_PRICE_NYNJ : COMPLETE_BUNDLE_PRICE;
    case ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE:
    case undefined:
      return nynj ? UPGRADE_PRICE_NYNJ : UPGRADE_PRICE;
  }
};
