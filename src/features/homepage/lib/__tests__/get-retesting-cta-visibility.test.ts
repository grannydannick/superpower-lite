import { describe, expect, it } from 'vitest';

import { type Credit, OrderStatus, type RequestGroup } from '@/types/api';

import { getRetestingCtaVisibility } from '../get-retesting-cta-visibility';

const DAY_MS = 1000 * 60 * 60 * 24;

const makeCredit = (overrides: Partial<Credit> = {}) =>
  ({
    id: overrides.id ?? 'credit-1',
    serviceId: overrides.serviceId ?? 'service-1',
    serviceName: overrides.serviceName ?? 'Service 1',
    collectionMethod: overrides.collectionMethod,
    ...overrides,
  }) satisfies Credit;

const makeRequestGroup = (overrides: Partial<RequestGroup> = {}) =>
  ({
    id: overrides.id ?? 'request-group-1',
    status: overrides.status ?? OrderStatus.completed,
    orders: overrides.orders ?? [],
    startTimestamp: overrides.startTimestamp,
    endTimestamp: overrides.endTimestamp,
    createdAt: overrides.createdAt,
    ...overrides,
  }) satisfies RequestGroup;

describe('getRetestingCtaVisibility', () => {
  it('shows when the user has no credits even without qualifying request groups', () => {
    const result = getRetestingCtaVisibility({
      nowMs: Date.parse('2026-04-23T00:00:00.000Z'),
      requestGroups: [
        makeRequestGroup({
          collectionMethod: 'AT_HOME',
          endTimestamp: '2025-12-31T17:00:00.000Z',
        }),
      ],
      credits: [],
      phlebotomyServiceIds: [],
    });

    expect(result).toBe(true);
  });

  it('hides when the last completed request group is 60 days old or newer and the user has other credits', () => {
    const nowMs = Date.parse('2026-04-23T00:00:00.000Z');
    const result = getRetestingCtaVisibility({
      nowMs,
      requestGroups: [
        makeRequestGroup({
          collectionMethod: 'IN_LAB',
          endTimestamp: new Date(nowMs - 60 * DAY_MS).toISOString(),
        }),
      ],
      credits: [
        makeCredit({
          collectionMethod: 'IN_LAB',
          serviceId: 'other-in-lab-service',
        }),
      ],
      phlebotomyServiceIds: ['phlebotomy-service'],
    });

    expect(result).toBe(false);
  });

  it('hides when the user already has a phlebotomy credit', () => {
    const result = getRetestingCtaVisibility({
      nowMs: Date.parse('2026-04-23T00:00:00.000Z'),
      requestGroups: [
        makeRequestGroup({
          collectionMethod: 'IN_LAB',
          endTimestamp: '2026-02-01T00:00:00.000Z',
        }),
      ],
      credits: [
        makeCredit({
          collectionMethod: 'IN_LAB',
          serviceId: 'phlebotomy-service',
        }),
      ],
      phlebotomyServiceIds: ['phlebotomy-service'],
    });

    expect(result).toBe(false);
  });

  it('shows when the user has a non-phlebotomy in-lab credit', () => {
    const result = getRetestingCtaVisibility({
      nowMs: Date.parse('2026-04-23T00:00:00.000Z'),
      requestGroups: [
        makeRequestGroup({
          collectionMethod: 'IN_LAB',
          endTimestamp: '2026-02-01T00:00:00.000Z',
        }),
      ],
      credits: [
        makeCredit({
          collectionMethod: 'IN_LAB',
          serviceId: 'other-in-lab-service',
        }),
      ],
      phlebotomyServiceIds: ['phlebotomy-service'],
    });

    expect(result).toBe(true);
  });

  it('uses the latest completed request group regardless of collection method when checking users with other credits', () => {
    const result = getRetestingCtaVisibility({
      nowMs: Date.parse('2026-04-23T00:00:00.000Z'),
      requestGroups: [
        makeRequestGroup({
          collectionMethod: 'IN_LAB',
          endTimestamp: '2026-02-01T00:00:00.000Z',
        }),
        makeRequestGroup({
          id: 'request-group-2',
          collectionMethod: 'AT_HOME',
          endTimestamp: '2026-04-10T00:00:00.000Z',
        }),
      ],
      credits: [
        makeCredit({
          collectionMethod: 'IN_LAB',
          serviceId: 'other-in-lab-service',
        }),
      ],
      phlebotomyServiceIds: ['phlebotomy-service'],
    });

    expect(result).toBe(false);
  });
});
