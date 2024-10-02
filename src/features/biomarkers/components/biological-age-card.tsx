import { Spinner } from '@/components/ui/spinner';
import { Body1, H1, H4 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/biomarkers/api';
import { calculateDNAmAge } from '@/features/biomarkers/utils/calculate-dnam-age';
import { useUser } from '@/lib/auth';
import { yearsSinceDate } from '@/utils/format';

export const BiologicalAgeCard = (): JSX.Element => {
  const biomarkersQuery = useBiomarkers();
  const { data: user } = useUser();

  if (biomarkersQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!biomarkersQuery.data) return <></>;
  if (!user) return <></>;

  const { dateOfBirth } = user;

  const biologicalAge = calculateDNAmAge(
    biomarkersQuery.data.biomarkers,
    dateOfBirth,
  );

  const ageDifference = biologicalAge
    ? Math.round((yearsSinceDate(user.dateOfBirth) - biologicalAge) * 10) / 10.0
    : null;

  return (
    <div
      className="h-[375px] w-full rounded-2xl px-8 py-12"
      style={{
        backgroundImage:
          user.gender.toUpperCase() === 'MALE'
            ? 'url("/cards/male_stance_blurry_2.png")'
            : 'url("/cards/female_stance_blurry.jpg")',
        backgroundSize: 'cover',
      }}
    >
      <div className="flex h-full flex-col justify-between space-y-20">
        <div className="flex items-center justify-between">
          <H4 className="text-white">Biological Age</H4>
          <Body1 className="text-white opacity-60">superpower.com</Body1>
        </div>
        <div>
          <H1 className="text-white">{biologicalAge || '--'}</H1>
          <Body1 className="text-white/80">
            {ageDifference !== null ? Math.abs(ageDifference) : '--'} years{' '}
            {ageDifference && ageDifference > 0 ? 'younger' : 'older'} than your
            chronological age
          </Body1>
        </div>
      </div>
    </div>
  );
};
