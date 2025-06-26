import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H1 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/biomarkers/api';
import { ScoreChart } from '@/features/biomarkers/components/charts/score-chart';
import { getHealthScoreDescription } from '@/features/biomarkers/utils/get-health-score-description';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import { cn } from '@/lib/utils';

export const ScoreCard = () => {
  const getBiomarkersQuery = useBiomarkers();
  if (getBiomarkersQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!getBiomarkersQuery.data) {
    return null;
  }

  const latestScore = mostRecent(
    getBiomarkersQuery.data.biomarkers.find((b) => b.name == 'Health Score')
      ?.value ?? [],
  );

  return (
    <div
      className={cn(
        'flex w-full flex-col justify-between rounded-3xl bg-primary p-5 items-center h-[276px]',
      )}
      style={{
        backgroundImage: 'url("/cards/score.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <SuperpowerScoreLogo />
      {latestScore?.quantity.value ? (
        <ScoreChart value={latestScore.quantity.value} />
      ) : (
        <H1 className="text-5xl text-white">--</H1>
      )}
      {latestScore?.quantity.value ? (
        <Body2 className="text-white">
          {getHealthScoreDescription(latestScore.quantity.value)}
        </Body2>
      ) : (
        <Body2 className="text-white">Awaiting lab results</Body2>
      )}
    </div>
  );
};
