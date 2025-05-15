import { LockIcon } from '@/components/icons';
import { ArrowTopRight } from '@/components/icons/arrow-top-right-icon';
import NumberFlow from '@/components/shared/number-flow';
import { Button } from '@/components/ui/button';
import { Body2, H1, H4 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/biomarkers/api';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { yearsSinceDate } from '@/utils/format';

export const BiologicalAgeCard = ({
  variant = 'home',
  onClick,
}: {
  variant?: 'home' | 'biomarkers';
  onClick?: () => void;
}) => {
  const biomarkersQuery = useBiomarkers();
  const { data: user } = useUser();

  if (!biomarkersQuery.data) return <></>;
  if (!user) return <></>;

  const biologicalAgeMarker = biomarkersQuery.data?.biomarkers.find(
    (b) => b.name == 'Biological Age',
  );
  const biologicalAge =
    mostRecent(biologicalAgeMarker?.value ?? [])?.quantity.value ?? null;

  const ageDifference = biologicalAge
    ? Math.round((yearsSinceDate(user.dateOfBirth) - biologicalAge) * 10) / 10.0
    : null;

  if (variant === 'home') {
    return (
      <div
        className={cn(
          'group flex h-56 w-full flex-col transition-all duration-300 justify-between outline-transparent focus:outline-1 focus:outline-white/20 overflow-hidden rounded-2xl border border-white/10 bg-zinc-400/30 p-4 backdrop-blur-xl hover:border-white/20 hover:bg-zinc-400/40',
          biologicalAge !== null ? 'cursor-pointer' : null,
          biomarkersQuery.isLoading ? 'opacity-50 animate-pulse' : null,
        )}
        onClick={biologicalAge !== null ? onClick : undefined}
        role="presentation"
      >
        <div className="flex h-full flex-col justify-start transition-opacity duration-500">
          <div className="flex w-full flex-1 justify-between gap-4">
            <H4 className="text-white">Biological Age</H4>
            {biologicalAge ? (
              <ArrowTopRight className="absolute right-5 top-5 text-white/50 transition-all duration-200 group-hover:right-4 group-hover:top-4 group-hover:text-white/75" />
            ) : (
              <LockIcon
                fill="currentColor"
                className="absolute right-5 top-5 w-5 text-white/50"
              />
            )}
          </div>
          <div className="flex w-full items-end justify-between gap-4">
            <div>
              {biologicalAge ? (
                <NumberFlow
                  value={biologicalAge}
                  className="text-6xl text-white"
                />
              ) : (
                <H1 className="text-white">--</H1>
              )}
              {ageDifference ? (
                <Body2 className="line-clamp-2 text-white">
                  {Math.abs(ageDifference)} years{' '}
                  {ageDifference >= 0 ? 'younger' : 'older'} than your
                  chronological age
                </Body2>
              ) : (
                <Body2 className="text-white">Awaiting lab results</Body2>
              )}
            </div>
            {biologicalAge && (
              <div className="md:hidden">
                <Button
                  type="button"
                  variant="white"
                  size="medium"
                  onClick={() => onClick?.()}
                  className="border border-primary/10"
                >
                  More info
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col justify-between rounded-3xl bg-primary p-5 items-center h-[276px]',
      )}
      style={{
        backgroundImage: 'url("/cards/age-card.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <H4 className="text-white">Biological Age</H4>

      <H1 className="text-6xl text-white">{biologicalAge || '--'}</H1>

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
