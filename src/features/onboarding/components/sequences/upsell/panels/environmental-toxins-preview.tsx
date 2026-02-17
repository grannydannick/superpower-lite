import { Body1, H2 } from '@/components/ui/typography';
import { useGender } from '@/hooks/use-gender';

import { Preview } from '../shared';

export const EnvironmentalToxinsPreview = () => {
  const { gender } = useGender();

  const backgroundImage =
    gender === 'female'
      ? '/onboarding/upsell/gender/toxins-female.webp'
      : '/onboarding/upsell/gender/toxins-male.webp';

  return (
    <Preview.Layout backgroundImage={backgroundImage}>
      <Preview.Header />
      <Preview.Content>
        <Preview.Label>Suggested based on your goals</Preview.Label>
        <H2 className="text-balance text-white md:text-zinc-900">
          Everyday chemicals add up in the body
        </H2>
        <Body1 className="text-zinc-400 md:text-zinc-500">
          Low-level exposure from food, air, water, and products can quietly
          affect hormones, metabolism, and energy.
        </Body1>
      </Preview.Content>
      <Preview.Footer>
        <Preview.PrimaryButton />
      </Preview.Footer>
    </Preview.Layout>
  );
};
