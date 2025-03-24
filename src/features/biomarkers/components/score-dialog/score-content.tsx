import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H3 } from '@/components/ui/typography';
import {
  HEALTH_OPTIMIZATION,
  ENVIRONMENTAL_TOXINS,
  NUTRITION_AND_GUT,
  LOOK_AND_FEEL,
} from '@/const/health-score';
import { useAffiliateLinks } from '@/features/affiliate/api';
import { ShareButtons } from '@/features/affiliate/components/share-buttons';
import { useBiomarkers } from '@/features/biomarkers/api';
import { BiomarkerDialogHeader } from '@/features/biomarkers/components/biomarker-dialog/biomarker-dialog-header';
import { BiomarkerDialogMetadata } from '@/features/biomarkers/components/biomarker-dialog/biomarker-dialog-metadata';
import { BiomarkerTimeSeriesChart } from '@/features/biomarkers/components/charts/biomarker-time-series-chart';
import { ReportBlock } from '@/features/biomarkers/components/score-dialog/record-block';
import { calculateDNAmAge } from '@/features/biomarkers/utils/calculate-dnam-age';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import { useUser } from '@/lib/auth';

export const ScoreContent = () => {
  const { data, isError } = useAffiliateLinks();
  const { data: user } = useUser();

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

  const healthScore = getBiomarkersQuery.data.biomarkers.find(
    (b) => b.name == 'Health Score',
  );

  if (!healthScore) {
    return null;
  }

  const latestScore = mostRecent(healthScore.value);

  const dateOfBirth = user?.dateOfBirth;
  const biologicalAge =
    dateOfBirth && getBiomarkersQuery.data
      ? calculateDNAmAge(getBiomarkersQuery.data.biomarkers, dateOfBirth)
      : null;

  const affiliateLink =
    !isError && data?.links?.length
      ? data.links[0].replace(/^https?:\/\//, '')
      : 'superpower.com';

  // Set share message based on the availability of biological age
  const shareMessage =
    biologicalAge !== null
      ? `I scored ${latestScore?.quantity.value} on my Superpower score report and my biological age is ${Math.floor(biologicalAge)}!\nIf you want to get a detailed report on your health, become a member at ${affiliateLink}`
      : `I scored ${latestScore?.quantity.value} on my Superpower score report!\nIf you want to get a detailed report on your health, become a member at ${affiliateLink}`;

  return (
    <>
      <BiomarkerDialogHeader
        name={healthScore.name}
        status={healthScore.status}
        result={healthScore.value[0]}
        unit={healthScore.unit}
      />
      <div className="p-6">
        <BiomarkerTimeSeriesChart biomarker={healthScore} />
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
          categoryScores={
            latestScore?.component.filter(
              (c) => c.category === HEALTH_OPTIMIZATION,
            ) ?? []
          }
          blockTitle={HEALTH_OPTIMIZATION}
        />
        <ReportBlock
          categoryScores={
            latestScore?.component.filter(
              (c) => c.category === ENVIRONMENTAL_TOXINS,
            ) ?? []
          }
          blockTitle={ENVIRONMENTAL_TOXINS}
        />
        <ReportBlock
          categoryScores={
            latestScore?.component.filter(
              (c) => c.category === NUTRITION_AND_GUT,
            ) ?? []
          }
          blockTitle={NUTRITION_AND_GUT}
        />
        <ReportBlock
          categoryScores={
            latestScore?.component.filter(
              (c) => c.category === LOOK_AND_FEEL,
            ) ?? []
          }
          blockTitle={LOOK_AND_FEEL}
        />
      </div>
      <Separator />
      <div className="flex flex-col gap-7 px-10 py-8">
        <BiomarkerDialogMetadata
          className="space-y-8"
          name={healthScore.name}
          description={healthScore.description}
          content={healthScore.metadata.content}
          importance={healthScore.importance}
        />
      </div>
    </>
  );
};
