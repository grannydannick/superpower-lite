import { UPGRADE_PRICE, UPGRADE_PRICE_NYNJ } from '@/const';
import { User } from '@/types/api';

export const getUpgradePrice = (user: User | undefined): number =>
  user?.primaryAddress?.state === 'NY' || user?.primaryAddress?.state === 'NJ'
    ? UPGRADE_PRICE_NYNJ
    : UPGRADE_PRICE;
