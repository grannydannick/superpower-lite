import { describe, expect, it } from 'vitest';

import {
  ADVANCED_UPGRADE_BUNDLE_IDS,
  ADVANCED_MICROBIOME_BUNDLE_PRICE,
  ADVANCED_MICROBIOME_BUNDLE_PRICE_NYNJ,
  COMPLETE_BUNDLE_PRICE,
  COMPLETE_BUNDLE_PRICE_NYNJ,
  UPGRADE_PRICE,
  UPGRADE_PRICE_NYNJ,
} from '@/const';
import type { User } from '@/types/api';

import { getUpgradePrice } from '../get-upgrade-price';

const baseUser = {
  id: 'u1',
  username: 'u1',
  firstName: 'T',
  lastName: 'E',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 't@e.com',
  phone: '555',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  subscribed: true,
  admin: false,
  authMethod: 'password',
  address: [],
  role: ['MEMBER'],
} satisfies User;

const nyUser = {
  ...baseUser,
  primaryAddress: {
    id: 'a1',
    line: ['1 Main St'],
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    use: 'home',
  },
} satisfies User;

describe('getUpgradePrice', () => {
  it('returns standard advanced upgrade pricing by default', () => {
    expect(getUpgradePrice(baseUser)).toBe(UPGRADE_PRICE);
    expect(
      getUpgradePrice(baseUser, ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE),
    ).toBe(UPGRADE_PRICE);
  });

  it('returns NY/NJ advanced upgrade pricing for NY members', () => {
    expect(getUpgradePrice(nyUser)).toBe(UPGRADE_PRICE_NYNJ);
    expect(
      getUpgradePrice(nyUser, ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE),
    ).toBe(UPGRADE_PRICE_NYNJ);
  });

  it('uses NY/NJ bundle pricing constants for NY/NJ members', () => {
    expect(
      getUpgradePrice(
        baseUser,
        ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE,
      ),
    ).toBe(ADVANCED_MICROBIOME_BUNDLE_PRICE);
    expect(
      getUpgradePrice(
        nyUser,
        ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE,
      ),
    ).toBe(ADVANCED_MICROBIOME_BUNDLE_PRICE_NYNJ);
    expect(
      getUpgradePrice(baseUser, ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE),
    ).toBe(COMPLETE_BUNDLE_PRICE);
    expect(
      getUpgradePrice(nyUser, ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE),
    ).toBe(COMPLETE_BUNDLE_PRICE_NYNJ);
  });
});
