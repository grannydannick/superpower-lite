import { Body1, H2 } from '@/components/ui/typography';
import { useGender } from '@/hooks/use-gender';

import { Preview } from '../shared';

export const GutMicrobiomePreview = () => {
  const { gender } = useGender();

  const backgroundImage =
    gender === 'female'
      ? '/onboarding/upsell/gender/gut-microbiome-female.webp'
      : '/onboarding/upsell/gender/gut-microbiome-male.webp';

  return (
    <Preview.Layout backgroundImage={backgroundImage}>
      <Preview.Header />
      <Preview.Content>
        <Preview.Label>Suggested based on your goals</Preview.Label>
        <H2 className="text-balance text-white md:text-zinc-900">
          Your gut shapes how you feel, function, and look
        </H2>
        <Body1 className="text-zinc-400 md:text-zinc-500">
          Measure the bacteria influencing digestion, immunity, mood and more.
        </Body1>
      </Preview.Content>
      <Preview.Footer>
        <Preview.PrimaryButton />
      </Preview.Footer>
    </Preview.Layout>
  );
};
