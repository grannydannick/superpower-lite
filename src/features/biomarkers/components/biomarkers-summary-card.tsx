import moment from 'moment';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/biomarkers/api';
import { ScoreDialog } from '@/features/biomarkers/components/score-dialog/score-dialog';
import { biomarkerStatusCount } from '@/features/biomarkers/utils/biomarkers-status-count';
import { useUser } from '@/lib/auth';

export const BiomarkersList = () => {
  const biomarkers = useBiomarkers();

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
  ]);
  const numLimited =
    biomarkers.data.biomarkers.length - numInRange - numNormal - numOutOfRange;

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
    {
      num: numLimited,
      text: `text-zinc-400`,
      label: 'Limited data',
    },
  ];

  return (
    <div className="flex flex-col">
      {statuses.map((status, index) => (
        <div
          className="grid grid-cols-[1.5rem,1fr] items-baseline gap-2"
          key={index}
        >
          <H3 className={`${status.text}`}>{status.num}</H3>
          <Body2 className="line-clamp-1 text-zinc-400">{status.label}</Body2>
        </div>
      ))}
    </div>
  );
};

export const BiomarkersSummaryCard = () => {
  const { data: user } = useUser();

  if (!user) {
    return <div className="md:p-16">No profile information found.</div>;
  }

  const { createdAt } = user;

  return (
    <div className="flex h-[276px] w-full flex-col items-center justify-between rounded-3xl bg-primary p-6">
      <div className="flex flex-col items-center">
        <H4 className="text-white">Results Summary</H4>
        <Body1 className="text-zinc-400">
          As of {moment(createdAt).format('DD MMM')}
        </Body1>
      </div>
      <div className="flex w-full items-end justify-between">
        <BiomarkersList />
        <ScoreDialog>
          <Button
            className="border border-zinc-700 bg-zinc-800 px-4 py-3"
            disabled
          >
            Score Report
          </Button>
        </ScoreDialog>
      </div>
    </div>
  );
};
