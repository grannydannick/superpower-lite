import { Hover3D } from '@/components/ui/hover-3d';
import { Switch } from '@/components/ui/switch';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/data/api';
import { mostRecent } from '@/features/data/utils/most-recent-biomarker';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { yearsSinceDate } from '@/utils/format';

import { cardVariants } from '../../utils/card-variants';

export const AgeShareCard = ({
  showAge,
  setShowAge,
}: {
  showAge: boolean;
  setShowAge: (showAge: boolean) => void;
}) => {
  const { data: user } = useUser();
  // const { data: avatar } = useAvatar({
  //   username: user?.username ?? '',
  // });
  const { data: biomarkersData } = useBiomarkers();
  const biologicalAgeMarker = biomarkersData?.biomarkers.find(
    (b) => b.name == 'Biological Age',
  );

  if (!biomarkersData || !biologicalAgeMarker || !user) {
    return <div>No biomarkers or user found</div>;
  }

  const { firstName, lastName } = user;

  const biologicalAge =
    mostRecent(biologicalAgeMarker?.value ?? [])?.quantity.value ?? null;

  const ageDifference = biologicalAge
    ? Math.round(
        (yearsSinceDate(user?.dateOfBirth ?? '') - biologicalAge) * 10,
      ) / 10.0
    : null;

  const isYounger =
    biologicalAge && biologicalAge < yearsSinceDate(user?.dateOfBirth ?? '');

  return (
    <div className="flex min-h-96 flex-col items-center">
      <Hover3D
        options={{
          shadow: {
            opacity: 0.1,
            color: 'rgba(0, 0, 0)',
          },
          resetOnHover: true,
          resetDuration: 500,
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'relative flex w-64 flex-col overflow-hidden animate-in zoom-in-95',
              cardVariants({ type: 'ageCard' }),
            )}
          >
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex size-full items-start justify-end gap-4 p-1">
                <H4
                  className={cn(
                    'absolute truncate text-center text-white transition-all duration-300',
                    showAge ? 'left-2' : 'left-1/2 -translate-x-1/2',
                  )}
                >
                  Biological Age
                </H4>
                <span
                  className={cn(
                    'mr-1 overflow-hidden text-ellipsis text-3xl text-white transition-all',
                    !showAge
                      ? '-mr-4 max-w-0 opacity-0'
                      : 'max-w-16 opacity-100',
                  )}
                >
                  {biologicalAge}
                </span>
              </div>
              {/* {avatar && (
                <div className="absolute left-1/2 top-1/2 -mt-4 size-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full [mask-image:radial-gradient(circle,black_10%,transparent_70%)]">
                  <div className="absolute inset-0 bg-emerald-600 mix-blend-soft-light" />
                  <Avatar src={avatar?.removedBg} className="size-full" />
                </div>
              )} */}
              <div className="p-1">
                <Body1 className="text-xl text-white">
                  {firstName} {lastName}
                </Body1>
                <Body2 className="text-white/60">
                  Your biological age is{' '}
                  <span className="text-white">
                    {Math.abs(ageDifference ?? 0)}{' '}
                    {isYounger ? 'younger' : 'older'}
                  </span>{' '}
                  than your calendar age
                </Body2>
              </div>
            </div>
          </div>
        </div>
      </Hover3D>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowAge(!showAge);
          }
        }}
        onClick={() => setShowAge(!showAge)}
        className="group mx-auto mt-10 flex cursor-pointer select-none items-center justify-center gap-4"
      >
        <Body1
          className={cn(
            'text-sm text-zinc-400 transition-colors duration-200 group-hover:text-zinc-500',
            !showAge && 'text-zinc-500',
          )}
        >
          Hide age
        </Body1>
        <Switch
          checked={!showAge}
          onCheckedChange={() => setShowAge(!showAge)}
        />
      </div>
    </div>
  );
};
