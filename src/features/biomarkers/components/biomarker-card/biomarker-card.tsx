import { getNormalContent } from '@/features/biomarkers/utils/get-normal-content';
import { Biomarker, MetadataContent } from '@/types/api';

import { BiomarkerTimeSeriesChart } from '../charts/biomarker-time-series-chart';

import { BiomarkerCardFooter } from './biomarker-card-footer';
import { BiomarkerCardHeader } from './biomarker-card-header';
import { BiomarkerCardMetadata } from './biomarker-card-metadata';

export interface BiomarkerDetailsProps {
  biomarker: Biomarker | undefined;
}

export function BiomarkerCard({
  biomarker,
}: BiomarkerDetailsProps): JSX.Element {
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

  // Passing sorted value back as a result.
  // Value is always the last data point in the time series data.
  return (
    <>
      <BiomarkerCardHeader
        name={name}
        status={status}
        result={sortedBiomarkerValues[0]}
        unit={unit}
      />
      <div className="p-6">
        <BiomarkerTimeSeriesChart biomarker={biomarker} />
      </div>
      <BiomarkerCardMetadata
        className="space-y-8 p-6"
        name={name}
        description={description}
        content={content}
        importance={importance}
      />
      <BiomarkerCardFooter
        containerClassName="sticky bottom-0"
        className="text-zinc-500"
        source={biomarker.metadata.source}
      />
    </>
  );
}
