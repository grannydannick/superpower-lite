import moment from 'moment';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { SUPERPOWER_BLOOD_PANEL } from '@/const';
import { useBiomarkers } from '@/features/biomarkers/api';
import { ScoreDialog } from '@/features/biomarkers/components/score-dialog/score-dialog';
import { biomarkerStatusCount } from '@/features/biomarkers/utils/biomarkers-status-count';
import { useOrders } from '@/features/orders/api';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/api';

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
      {statuses.map((status, index) => (
        <div
          className="grid grid-cols-[1.2rem,1fr] items-baseline gap-2"
          key={index}
        >
          <H4 className={cn(status.text)}>{status.num}</H4>
          <Body2 className="line-clamp-1 text-zinc-400">{status.label}</Body2>
        </div>
      ))}
    </div>
  );
};

export const BiomarkersSummaryCard = ({
  variant = 'home',
}: {
  variant?: 'home' | 'biomarkers';
}) => {
  const { data } = useOrders();

  const orders = data?.orders.filter(
    (o) =>
      o.status === OrderStatus.completed && o.name === SUPERPOWER_BLOOD_PANEL,
  );

  // we have this filter: orderBy: [{ createdAt: 'desc' }] on backend for orders
  const mostRecentOrder = orders?.[0];

  return (
    <div
      className={cn(
        'flex w-full flex-col justify-between rounded-3xl bg-primary p-5',
        variant === 'biomarkers' ? 'items-center h-[276px]' : 'h-[188px]',
      )}
    >
      <div className="flex flex-col">
        <H4 className="text-white">Results</H4>
        {mostRecentOrder ? (
          <Body1 className="text-zinc-400">
            As of {moment(mostRecentOrder.timestamp).format('DD MMM')}
          </Body1>
        ) : (
          <Body1 className="text-zinc-400">Not available yet.</Body1>
        )}
      </div>
      <div className="flex w-full items-end justify-between">
        <BiomarkersList />
        <ScoreDialog>
          <Button className="border border-zinc-700 bg-zinc-800 px-4 py-3">
            Score Report
          </Button>
        </ScoreDialog>
      </div>
    </div>
  );
};
