import { useShallow } from 'zustand/react/shallow';

import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Body1, H3 } from '@/components/ui/typography';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useBiomarkers } from '@/features/biomarkers/api';
import { useHealthScoreByOrderId } from '@/features/biomarkers/api/get-healthscore-by-orderid';
import { BiomarkersList } from '@/features/biomarkers/components/biomarker-cards';
import { ScoreChart } from '@/features/biomarkers/components/charts/score-chart';
import { ScoreDialog } from '@/features/biomarkers/components/score-dialog/score-dialog';
import { calculateDNAmAge } from '@/features/biomarkers/utils/calculate-dnam-age';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { yearsSinceDate } from '@/utils/format';

export const HealthScore = ({ className }: { className?: string }) => {
  const { orderId } = usePlan(useShallow((s) => s));

  const { data: user } = useUser();
  const biomarkersQuery = useBiomarkers();
  const healthScoreQuery = useHealthScoreByOrderId({
    orderId,
    queryConfig: { enabled: !!orderId },
  });

  const dateOfBirth = user?.dateOfBirth;

  if (!healthScoreQuery.data || !biomarkersQuery.data || !dateOfBirth) {
    return null;
  }

  const healthScoreResult = healthScoreQuery.data.healthScoreResult;

  if (!healthScoreResult) {
    return null;
  }

  const biologicalAge = calculateDNAmAge(
    biomarkersQuery.data.biomarkers,
    user?.dateOfBirth,
  );

  const ageDifference = biologicalAge
    ? Math.round((yearsSinceDate(user?.dateOfBirth) - biologicalAge) * 10) /
      10.0
    : null;

  return (
    <div className={cn(className)}>
      <H3>Health Score</H3>
      <div>
        <Body1>{healthScoreResult.finalScoreStatus}</Body1>
        <ScoreDialog>
          <Body1 className="text-vermillion-900">Score breakdown</Body1>
        </ScoreDialog>
      </div>
      <div className="flex min-h-[260px] flex-col gap-2 md:flex-row">
        <div className="flex w-full flex-col items-center justify-between gap-2 rounded-2xl border border-zinc-200 p-6">
          <SuperpowerScoreLogo logoColor="#71717A" />
          <ScoreChart
            value={healthScoreResult.finalScore}
            richColors
            labelColor="#71717A"
          />
          <div>
            <Body1 className="text-zinc-500">
              Biological Age: {biologicalAge}
            </Body1>
            <Body1 className="text-zinc-500 opacity-50">
              {ageDifference !== null ? Math.abs(ageDifference) : '--'} years{' '}
              {ageDifference && ageDifference > 0 ? 'younger' : 'older'} than
              actual age
            </Body1>
          </div>
        </div>
        <div className="flex w-full flex-col justify-between gap-2 rounded-2xl border border-zinc-200 p-6">
          <Body1 className="text-zinc-500">Areas of Health Summary</Body1>
          <BiomarkersList />
        </div>
      </div>
    </div>
  );
};
