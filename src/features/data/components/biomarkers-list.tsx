import { Spinner } from '@/components/ui/spinner';
import { Body2, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { useDataBiomarkers } from '../api/get-data-biomarkers';
import { biomarkerStatusCount } from '../utils/biomarkers-status-count';

export const BiomarkersList = () => {
  const biomarkers = useDataBiomarkers();

  if (biomarkers.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!biomarkers.data) return <></>;

  const numInRange = biomarkerStatusCount(biomarkers.data.biomarkers, [
    'OPTIMAL',
  ]);
  const numNormal = biomarkerStatusCount(biomarkers.data.biomarkers, [
    'NORMAL',
  ]);
  const numOutOfRange = biomarkerStatusCount(biomarkers.data.biomarkers, [
    'HIGH',
    'LOW',
    'ABNORMAL',
  ]);

  /*
   * https://tailwindcss.com/docs/content-configuration#dynamic-class-names
   *
   * Make sure not to change this and try to optimize,
   *
   * text and background variables introduced because of the issue mentioned above ^
   *
   * */
  const statuses = [
    {
      num: numInRange,
      text: `text-green-500`,
      label: 'Optimal',
    },
    {
      num: numNormal,
      text: `text-yellow-500`,
      label: 'Normal',
    },
    {
      num: numOutOfRange,
      text: `text-pink-500`,
      label: 'Out of range',
    },
  ];

  return (
    <div className="flex flex-col">
      {statuses.map((status) => (
        <div
          className="grid grid-cols-[1.2rem,1fr] items-baseline gap-2"
          key={status.label}
        >
          <H4 className={cn(status.text)}>{status.num}</H4>
          <Body2 className="line-clamp-1 text-zinc-400">{status.label}</Body2>
        </div>
      ))}
    </div>
  );
};
