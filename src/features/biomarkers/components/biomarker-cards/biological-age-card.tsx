import { Body2, H1, H4 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { useBiologicalAge } from '../../hooks/use-biological-age';

export const BiologicalAgeCard = () => {
  const { data: user } = useUser();
  const { biologicalAge, ageDifference, isYounger } = useBiologicalAge();

  if (!user) return <></>;

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
          {Math.abs(ageDifference)} years {isYounger ? 'younger' : 'older'} than
          your actual age
        </Body2>
      ) : (
        <Body2 className="text-white">Awaiting lab results</Body2>
      )}
    </div>
  );
};
