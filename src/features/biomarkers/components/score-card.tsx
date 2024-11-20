import { SuperpowerScoreLogo } from '@/components/shared/score-logo';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H1, H4 } from '@/components/ui/typography';
import { useLatestHealthScore } from '@/features/biomarkers/api/get-latest-healthscore';
import { cn } from '@/lib/utils';

export const ScoreCard = ({ variant }: { variant?: 'home' | 'biomarkers' }) => {
  const getLatestHealthScoreQuery = useLatestHealthScore();

  if (getLatestHealthScoreQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!getLatestHealthScoreQuery.data) {
    return null;
  }

  const latestScore = getLatestHealthScoreQuery.data.healthScoreResult;

  return (
    <div
      className={cn(
        'flex w-full flex-col justify-between rounded-3xl bg-primary p-5',
        variant === 'biomarkers' ? 'items-center h-[276px]' : 'h-[188px]',
      )}
      style={{
        backgroundImage: 'url("/cards/score.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <SuperpowerScoreLogo />
      <div className="flex items-end gap-1">
        <H1 className="text-white">{latestScore?.finalScore || '--'}</H1>
        {latestScore?.finalScore ? <H4 className="text-white">/ 100</H4> : null}
      </div>
      {latestScore?.finalScoreStatus ? (
        <Body2 className="text-white">{latestScore?.finalScoreStatus}</Body2>
      ) : (
        <Body2 className="text-white">Awaiting lab results</Body2>
      )}
    </div>
  );
};
