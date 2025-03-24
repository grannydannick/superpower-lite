import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/biomarkers/api';
import { BiomarkersList } from '@/features/biomarkers/components/biomarker-cards';
import { ScoreChart } from '@/features/biomarkers/components/charts/score-chart';
import { ScoreDialog } from '@/features/biomarkers/components/score-dialog/score-dialog';
import { calculateDNAmAge } from '@/features/biomarkers/utils/calculate-dnam-age';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import {
  PlanSection,
  PlanSectionHeader,
  PlanSectionTitle,
  PlanSectionContent,
} from '@/features/plans/components/plan-section';
import { useUser } from '@/lib/auth';
import { yearsSinceDate } from '@/utils/format';

export function PlanHealthScore() {
  const { data: user } = useUser();
  const { data: biomarkersData, isLoading: biomarkersLoading } =
    useBiomarkers();

  if (!user) return null;

  if (biomarkersLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!biomarkersData) {
    return null;
  }

  const healthScore = biomarkersData.biomarkers.find(
    (b) => b.name == 'Health Score',
  );

  if (!healthScore) {
    console.warn('Health score not found.');
    return null;
  }

  const latestScore = mostRecent(healthScore.value);

  if (!latestScore) {
    console.warn('Latest health score not found.');
    return null;
  }

  // we should use memo it
  const biologicalAge = calculateDNAmAge(
    biomarkersData.biomarkers,
    user.dateOfBirth,
  );

  // we should use memo it
  const ageDifference = biologicalAge
    ? Math.round((yearsSinceDate(user.dateOfBirth) - biologicalAge) * 10) / 10.0
    : 0;

  return (
    <PlanSection>
      <PlanSectionHeader>
        <PlanSectionTitle className="flex items-center gap-2">
          Health Score
        </PlanSectionTitle>
      </PlanSectionHeader>

      <PlanSectionContent>
        <div className="mb-8">
          <Body1>
            Your score is{' '}
            {latestScore.quantity.value === 100
              ? 'perfect'
              : latestScore.quantity.value >= 80
                ? 'good'
                : latestScore.quantity.value >= 50
                  ? 'fair'
                  : 'poor'}
            . Stick to the plan to keep improving!
          </Body1>
          <ScoreDialog>
            <Body1 className="text-vermillion-900">Score breakdown</Body1>
          </ScoreDialog>
        </div>
        <div className="flex min-h-[260px] flex-col gap-2 md:flex-row">
          <div className="flex w-full flex-col items-center justify-between gap-2 rounded-2xl border border-zinc-200 p-6">
            <SuperpowerScoreLogo logoColor="#71717A" />
            <ScoreChart
              value={latestScore.quantity.value}
              richColors
              labelColor="#71717A"
            />
            <div>
              <Body1 className="text-zinc-500">
                Biological Age: {biologicalAge?.toFixed(0)}
              </Body1>
              <Body1 className="text-zinc-500 opacity-50">
                {Math.abs(ageDifference).toFixed(0)} years{' '}
                {ageDifference > 0 ? 'younger' : 'older'} than actual age
              </Body1>
            </div>
          </div>
          <div className="flex w-full flex-col justify-between gap-2 rounded-2xl border border-zinc-200 p-6">
            <Body1 className="text-zinc-500">Areas of Health Summary</Body1>
            <BiomarkersList />
          </div>
        </div>
      </PlanSectionContent>
    </PlanSection>
  );
}
