import { Separator } from '@/components/ui/separator';
import { Body2 } from '@/components/ui/typography';
import { useAffiliateLinks } from '@/features/affiliate/api';
import { ShareButtons } from '@/features/affiliate/components/share-buttons';
import { getNormalContent } from '@/features/biomarkers/utils/get-normal-content';
import { Biomarker, MetadataContent } from '@/types/api';

import { BiomarkerTimeSeriesChart } from '../charts/biomarker-time-series-chart';

import { BiomarkerDialogFooter } from './biomarker-dialog-footer';
import { BiomarkerDialogHeader } from './biomarker-dialog-header';
import { BiomarkerDialogMetadata } from './biomarker-dialog-metadata';

export interface BiomarkerDetailsProps {
  biomarker: Biomarker | undefined;
}

export function BiomarkerDialog({
  biomarker,
}: BiomarkerDetailsProps): JSX.Element {
  const { data, isError } = useAffiliateLinks();
  const affiliateLink =
    !isError && data?.links?.length
      ? data.links[0].replace(/^https?:\/\//, '')
      : 'superpower.com';

  if (!biomarker) return <></>;

  const { name, unit, description, importance, status, metadata } = biomarker;

  let content: MetadataContent[] = [];

  if (status === 'NORMAL') {
    content = getNormalContent(biomarker);
  } else {
    content = metadata.content.filter((content: MetadataContent) => {
      return content.status.toLowerCase() === status.toLowerCase();
    });
  }

  const sortedBiomarkerValues = biomarker.value.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const latestValue = sortedBiomarkerValues[0]?.quantity.value || 'N/A';
  const shareMessage = `My ${name.toLowerCase()} is ${latestValue} ${unit} which is in the ${status.toLowerCase()} range.\nWant to know yours? Become a member at ${affiliateLink}`;

  // Passing sorted value back as a result.
  // Value is always the last data point in the time series data.
  return (
    <>
      <BiomarkerDialogHeader
        name={name}
        status={status}
        result={sortedBiomarkerValues[0]}
        unit={unit}
      />
      <div className="p-6">
        <BiomarkerTimeSeriesChart biomarker={biomarker} />
      </div>
      <div className="flex flex-col justify-between gap-2 px-6 pb-6 sm:flex-row sm:items-center">
        <Body2 className="text-secondary">
          See how your {name} compares with your friends!
        </Body2>
        <ShareButtons message={shareMessage} />
      </div>
      <Separator />
      <BiomarkerDialogMetadata
        className="space-y-8 p-6"
        name={name}
        description={description}
        content={content}
        importance={importance}
      />
      <BiomarkerDialogFooter
        containerClassName="sticky bottom-0"
        className="text-zinc-500"
        source={biomarker.metadata.source}
      />
    </>
  );
}
