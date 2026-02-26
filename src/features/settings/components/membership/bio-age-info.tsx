import { Body1, H2 } from '@/components/ui/typography';
import { useBiomarkers } from '@/features/data/api';
import { mostRecent } from '@/features/data/utils/most-recent-biomarker';

export const BIO_AGE = 'Biological Age';

export const BiologicalAgeInfo = () => {
  const { data: biomarkersData } = useBiomarkers();
  const bioAgeMarker = biomarkersData?.biomarkers.find(
    (b) => b.name == BIO_AGE,
  );

  if (!biomarkersData || !bioAgeMarker) {
    return null;
  }

  const bioAgeValue =
    mostRecent(bioAgeMarker.value ?? [])?.quantity.value ?? null;

  return (
    <div className="flex flex-col items-end pb-0.5 text-sm">
      <H2 className="text-white">{bioAgeValue}</H2>
      <Body1 className="text-white">Biological years old</Body1>
    </div>
  );
};
