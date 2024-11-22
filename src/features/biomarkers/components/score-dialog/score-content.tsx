import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H3 } from '@/components/ui/typography';
import { useAffiliateLinks } from '@/features/affiliate/api';
import { ShareButtons } from '@/features/affiliate/components/share-buttons';
import { useBiomarkers } from '@/features/biomarkers/api';
import { useHealthScores } from '@/features/biomarkers/api/get-all-healthscores';
import { BiomarkerCardHeader } from '@/features/biomarkers/components/biomarker-card/biomarker-card-header';
import { BiomarkerCardMetadata } from '@/features/biomarkers/components/biomarker-card/biomarker-card-metadata';
import { BiomarkerTimeSeriesChart } from '@/features/biomarkers/components/charts/biomarker-time-series-chart';
import { ReportBlock } from '@/features/biomarkers/components/score-dialog/record-block';
import { calculateDNAmAge } from '@/features/biomarkers/utils/calculate-dnam-age';
import { scoreBiomarker } from '@/features/biomarkers/utils/score-biomarker';
import { useUser } from '@/lib/auth';
import { HealthScoreResult } from '@/types/api';

export const ScoreContent = ({
  latestScore,
}: {
  latestScore: HealthScoreResult;
}) => {
  const healthScoresQuery = useHealthScores();
  const { data, isError } = useAffiliateLinks();
  const { data: user } = useUser();
  const biomarkersQuery = useBiomarkers();

  const dateOfBirth = user?.dateOfBirth;
  const biologicalAge =
    dateOfBirth && biomarkersQuery.data
      ? calculateDNAmAge(biomarkersQuery.data.biomarkers, dateOfBirth)
      : null;

  const affiliateLink =
    !isError && data?.links?.length
      ? data.links[0].replace(/^https?:\/\//, '')
      : 'superpower.com';

  // Set share message based on the availability of biological age
  const shareMessage =
    biologicalAge !== null
      ? `I scored ${latestScore.finalScore} on my Superpower score report and my biological age is ${Math.floor(biologicalAge)}!\nIf you want to get a detailed report on your health, become a member at ${affiliateLink}`
      : `I scored ${latestScore.finalScore} on my Superpower score report!\nIf you want to get a detailed report on your health, become a member at ${affiliateLink}`;

  if (healthScoresQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!healthScoresQuery.data) {
    return null;
  }

  const healthScores = healthScoresQuery.data.healthScores;
  const transformedScore = scoreBiomarker(healthScores, latestScore.finalScore);

  return (
    <>
      <BiomarkerCardHeader
        name={transformedScore.name}
        status={transformedScore.status}
        result={transformedScore.value[0]}
        unit={transformedScore.unit}
      />
      <div className="p-6">
        <BiomarkerTimeSeriesChart biomarker={transformedScore} />
      </div>
      <div className="flex flex-row items-center justify-between px-6">
        <Body2 className="text-secondary">
          See how your health score compares with your friends!
        </Body2>
        <ShareButtons message={shareMessage} />
      </div>
      <Separator />
      <div className="flex flex-col gap-7 px-10 py-8">
        <H3>Latest Superpower Report Summary</H3>
        <ReportBlock
          categoryScores={latestScore.categoryScores.prevention}
          blockTitle="Health Optimization"
        />
        <ReportBlock
          categoryScores={latestScore.categoryScores.environmental}
          blockTitle="Environmental toxins"
        />
        <ReportBlock
          categoryScores={latestScore.categoryScores.nutrition}
          blockTitle="Nutrition & Gut"
        />
        <ReportBlock
          categoryScores={latestScore.categoryScores.lookAndFeel}
          blockTitle="Look & feel"
        />
      </div>
      <Separator />
      <div className="flex flex-col gap-7 px-10 py-8">
        <BiomarkerCardMetadata
          className="space-y-8"
          name={transformedScore.name}
          description={transformedScore.description}
          content={transformedScore.metadata.content}
          importance={transformedScore.importance}
        />
      </div>
    </>
  );
};
