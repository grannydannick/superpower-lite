import { type ScoreRevealMetrics } from '@/features/homepage/types/score-reveal-metrics';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

interface HomepageScoreMetricInput {
  nowMs: number;
  dateOfBirth: string;
  healthScoreTimestamp: string;
  healthScoreValue: number;
  bioAgeTimestamp: string;
  bioAgeValue: number;
}

interface HomepageHealthScoreMetricInput {
  nowMs: number;
  healthScoreTimestamp: string;
  healthScoreValue: number;
}

interface HomepageBioAgeMetricInput {
  nowMs: number;
  dateOfBirth: string;
  bioAgeTimestamp: string;
  bioAgeValue: number;
}

export interface HomepageHealthScoreMetrics {
  superpowerScore: number;
  daysSinceLastTest: number;
}

export interface HomepageBioAgeMetrics {
  biologicalAge: number;
  ageDifference: number;
  isBiologicallyYounger: boolean;
}

export type HomepageScoreMetrics = ScoreRevealMetrics;

export function getHomepageHealthScoreMetrics(
  input: HomepageHealthScoreMetricInput,
) {
  const healthScoreMs = new Date(input.healthScoreTimestamp).getTime();

  if (Number.isNaN(healthScoreMs)) return null;

  const elapsedSinceHealthScore = input.nowMs - healthScoreMs;
  const daysSinceLastTest = Math.max(
    0,
    Math.floor(elapsedSinceHealthScore / MS_PER_DAY),
  );

  return {
    superpowerScore: input.healthScoreValue,
    daysSinceLastTest,
  };
}

export function getHomepageBioAgeMetrics(input: HomepageBioAgeMetricInput) {
  const birthMs = new Date(input.dateOfBirth).getTime();
  const bioAgeMs = new Date(input.bioAgeTimestamp).getTime();

  if (Number.isNaN(birthMs)) return null;
  if (Number.isNaN(bioAgeMs)) return null;

  const realAgeAtBioTest = (bioAgeMs - birthMs) / MS_PER_YEAR;
  let biologicalAge = input.bioAgeValue;

  if (realAgeAtBioTest > 0) {
    const yearsSinceBioTest = (input.nowMs - bioAgeMs) / MS_PER_YEAR;
    const paceOfAging = input.bioAgeValue / realAgeAtBioTest;
    biologicalAge += yearsSinceBioTest * paceOfAging;
  }

  const roundedBiologicalAge = Math.round(biologicalAge * 10) / 10;
  const realAge = (input.nowMs - birthMs) / MS_PER_YEAR;
  const ageDifference = Math.round((realAge - roundedBiologicalAge) * 10) / 10;

  return {
    biologicalAge: roundedBiologicalAge,
    ageDifference,
    isBiologicallyYounger: ageDifference > 0,
  };
}

export function getHomepageScoreMetrics(input: HomepageScoreMetricInput) {
  const scoreMetrics = getHomepageHealthScoreMetrics({
    nowMs: input.nowMs,
    healthScoreTimestamp: input.healthScoreTimestamp,
    healthScoreValue: input.healthScoreValue,
  });
  const bioAgeMetrics = getHomepageBioAgeMetrics({
    nowMs: input.nowMs,
    dateOfBirth: input.dateOfBirth,
    bioAgeTimestamp: input.bioAgeTimestamp,
    bioAgeValue: input.bioAgeValue,
  });

  if (scoreMetrics == null || bioAgeMetrics == null) return null;

  return {
    ...scoreMetrics,
    ...bioAgeMetrics,
  };
}
