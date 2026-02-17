import { Body1, H2 } from '@/components/ui/typography';
import { useGender } from '@/hooks/use-gender';

import { Preview } from '../shared';

export const MetabolicPreview = () => {
  const { gender } = useGender();

  const backgroundImage =
    gender === 'female'
      ? '/onboarding/upsell/gender/metabolic-female.webp'
      : '/onboarding/upsell/gender/metabolic-male.webp';

  return (
    <Preview.Layout backgroundImage={backgroundImage}>
      <Preview.Header />
      <Preview.Content>
        <Preview.Label>Suggested based on your goals</Preview.Label>
        <H2 className="text-balance text-white md:text-zinc-900">
          Your metabolism holds the key to energy
        </H2>
        <Body1 className="text-zinc-400 md:text-zinc-500">
          Fatigue, weight gain, and brain fog often trace back to metabolic
          dysfunction. Testing reveals what&apos;s really going on inside.
        </Body1>
      </Preview.Content>
      <Preview.Footer>
        <Preview.PrimaryButton />
      </Preview.Footer>
    </Preview.Layout>
  );
};
