import moment from 'moment';

import { Spinner } from '@/components/ui/spinner';
import { Body1, H4 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/biomarkers/api';
import { biomarkerStatusCount } from '@/features/biomarkers/utils/biomarkers-status-count';
import { useUser } from '@/lib/auth';

export const BiomarkersSummaryCard = (): JSX.Element => {
  const biomarkers = useBiomarkers();
  const { data: user } = useUser();

  if (biomarkers.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!biomarkers.data) return <></>;

  if (!user) {
    return <div className="md:p-16">No profile information found.</div>;
  }

  const { createdAt } = user;

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
      text: `text-[#00FCA1]`,
      background: `#00FCA1`,
      label: 'Optimal',
    },
    {
      num: numNormal,
      text: `text-[#D7DB0E]`,
      background: `#D7DB0E`,
      label: 'Normal',
    },
    {
      num: numOutOfRange,
      text: `text-[#FF68DE]`,
      background: `#FF68DE`,
      label: 'Out of range',
    },
  ];

  const totalBiomarkerCount = statuses.reduce(
    (acc, status) => acc + status.num,
    0,
  );

  return (
    <div className="flex h-[375px] w-full flex-col justify-between rounded-3xl bg-[#18181B] p-6">
      <div>
        <H4 className="text-white">
          Results as of {moment(createdAt).format('DD MMMM')}
        </H4>
        <Body1 className="text-zinc-600">
          {moment(createdAt).format('YYYY')}
        </Body1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            {statuses.map((status, index) => (
              // make sure to keep it like that (refer to comment above statuses)
              <H4 key={index} className={`${status.text} text-[18px]`}>
                {status.num}
              </H4>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {statuses.map((status, index) => (
              <H4 key={index} className="text-[18px] text-zinc-400">
                {status.label}
              </H4>
            ))}
          </div>
        </div>
        <div className="flex w-full">
          {totalBiomarkerCount > 0 &&
            statuses.map((status, index) => (
              <div
                key={index}
                className="flex h-full rounded-md"
                style={{
                  backgroundColor: status.background,
                  width: `${(status.num / totalBiomarkerCount) * 100}%`,
                  height: '6px',
                  margin: '2px',
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
