import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { bioAgeQuery, healthScoreQuery } from '@/features/homepage/api/queries';
import { CardSkeleton } from '@/features/homepage/components/card-skeleton';
import { HomepageCard } from '@/features/homepage/components/homepage-card';
import { BiologicalAgeCard } from '@/features/homepage/components/score-cards/biological-age-card';
import { SuperpowerScoreCard } from '@/features/homepage/components/score-cards/superpower-score-card';
import { ScoreRevealOverlay } from '@/features/homepage/components/score-reveal-overlay';
import {
  getHomepageBioAgeMetrics,
  getHomepageHealthScoreMetrics,
} from '@/features/homepage/lib/get-homepage-score-metrics';
import { type ScoreRevealMetrics } from '@/features/homepage/types/score-reveal-metrics';
import { useNowMs } from '@/hooks/use-now-ms';
import { useUser } from '@/lib/auth';

export function ScoreCards() {
  const { data: user } = useUser();
  const healthScoreQueryResult = useQuery(healthScoreQuery());
  const bioAgeQueryResult = useQuery(bioAgeQuery());
  const [revealType, setRevealType] = useState<'score' | 'age' | null>(null);
  const nowMs = useNowMs();

  if (user == null) return null;

  const healthScore = healthScoreQueryResult.data?.healthScore;
  const bioAgeResult = bioAgeQueryResult.data?.bioAge;
  const scoreMetrics =
    healthScore == null
      ? null
      : getHomepageHealthScoreMetrics({
          nowMs,
          healthScoreTimestamp: healthScore.timestamp,
          healthScoreValue: healthScore.quantity?.value ?? 0,
        });
  const bioAgeMetrics =
    bioAgeResult == null
      ? null
      : getHomepageBioAgeMetrics({
          nowMs,
          dateOfBirth: user.dateOfBirth,
          bioAgeTimestamp: bioAgeResult.timestamp,
          bioAgeValue: bioAgeResult.quantity?.value ?? 0,
        });

  if (
    scoreMetrics == null &&
    bioAgeMetrics == null &&
    (healthScoreQueryResult.isPending || bioAgeQueryResult.isPending)
  ) {
    return <CardSkeleton />;
  }

  if (scoreMetrics == null && bioAgeMetrics == null) return null;

  let overlayMetrics: ScoreRevealMetrics | null = null;
  if (revealType === 'score') {
    overlayMetrics =
      scoreMetrics == null
        ? null
        : {
            ...scoreMetrics,
            biologicalAge: 0,
            ageDifference: 0,
            isBiologicallyYounger: false,
          };
  }
  if (revealType === 'age') {
    overlayMetrics =
      bioAgeMetrics == null
        ? null
        : {
            superpowerScore: 0,
            daysSinceLastTest: 0,
            ...bioAgeMetrics,
          };
  }

  return (
    <>
      <HomepageCard>
        <div className="grid w-full grid-cols-1 gap-2 xl:grid-cols-2">
          {scoreMetrics != null ? (
            <SuperpowerScoreCard
              superpowerScore={scoreMetrics.superpowerScore}
              daysSinceLastTest={scoreMetrics.daysSinceLastTest}
              onReveal={() => setRevealType('score')}
            />
          ) : null}
          {bioAgeMetrics != null ? (
            <BiologicalAgeCard
              biologicalAge={bioAgeMetrics.biologicalAge}
              ageDifference={bioAgeMetrics.ageDifference}
              onReveal={() => setRevealType('age')}
            />
          ) : null}
        </div>
      </HomepageCard>
      {revealType && overlayMetrics != null ? (
        <ScoreRevealOverlay
          type={revealType}
          onClose={() => setRevealType(null)}
          firstName={user.firstName}
          metrics={overlayMetrics}
        />
      ) : null}
    </>
  );
}
