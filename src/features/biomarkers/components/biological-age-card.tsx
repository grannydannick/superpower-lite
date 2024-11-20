import { Spinner } from '@/components/ui/spinner';
import { Body2, H1, H4 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/biomarkers/api';
import { calculateDNAmAge } from '@/features/biomarkers/utils/calculate-dnam-age';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { yearsSinceDate } from '@/utils/format';

export const BiologicalAgeCard = ({
  variant,
}: {
  variant?: 'home' | 'biomarkers';
}) => {
  const biomarkersQuery = useBiomarkers();
  const { data: user } = useUser();
  const { selectedPatient } = useCurrentPatient();

  if (biomarkersQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  if (!biomarkersQuery.data) return <></>;
  if (!user) return <></>;

  const dateOfBirth = selectedPatient
    ? selectedPatient.dateOfBirth
    : user.dateOfBirth;

  const biologicalAge = calculateDNAmAge(
    biomarkersQuery.data.biomarkers,
    dateOfBirth,
  );

  const ageDifference = biologicalAge
    ? Math.round((yearsSinceDate(dateOfBirth) - biologicalAge) * 10) / 10.0
    : null;

  return (
    <div
      className={cn(
        'flex w-full flex-col justify-between rounded-3xl bg-primary p-5',
        variant === 'biomarkers' ? 'items-center h-[276px]' : 'h-[188px]',
      )}
      style={{
        backgroundImage: 'url("/cards/age-card.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <H4 className="text-white">Biological Age</H4>

      <H1 className="text-white">{biologicalAge || '--'}</H1>

      {ageDifference !== null ? (
        <Body2 className="text-white">
          {Math.abs(ageDifference)} years{' '}
          {ageDifference && ageDifference > 0 ? 'younger' : 'older'} than your
          actual age
        </Body2>
      ) : (
        <Body2 className="text-white">Awaiting lab results</Body2>
      )}
    </div>
  );
};
