import { describe, expect, it } from 'vitest';

import { getHomepageScoreMetrics } from '@/features/homepage/lib/get-homepage-score-metrics';

describe('getHomepageScoreMetrics', () => {
  it('keeps the homepage score card and reveal overlay on one shared biological-age story', () => {
    const metrics = getHomepageScoreMetrics({
      nowMs: Date.parse('2026-01-01T00:00:00.000Z'),
      dateOfBirth: '2000-01-01T00:00:00.000Z',
      healthScoreTimestamp: '2025-12-22T00:00:00.000Z',
      healthScoreValue: 88,
      bioAgeTimestamp: '2025-01-01T00:00:00.000Z',
      bioAgeValue: 20,
    });

    expect(metrics).toEqual({
      superpowerScore: 88,
      daysSinceLastTest: 10,
      biologicalAge: 20.8,
      ageDifference: 5.2,
      isBiologicallyYounger: true,
    });
  });
});
