import { Body1, H2 } from '@/components/ui/typography';
import { useGender } from '@/hooks/use-gender';

import { Preview } from '../shared';

export const AutoimmunePreview = () => {
  const { gender } = useGender();

  const backgroundImage =
    gender === 'female'
      ? '/onboarding/upsell/gender/auto-immune-female.webp'
      : '/onboarding/upsell/gender/auto-immune-male.webp';

  return (
    <Preview.Layout backgroundImage={backgroundImage}>
      <Preview.Header />
      <Preview.Content>
        <Preview.Label>Suggested based on your goals</Preview.Label>
        <H2 className="text-balance text-white md:text-zinc-900">
          Your immune system could be working against you
        </H2>
        <Body1 className="text-zinc-400 md:text-zinc-500">
          Autoimmune conditions often develop silently for years. Early
          detection can help you take preventive action.
        </Body1>
      </Preview.Content>
      <Preview.Footer>
        <Preview.PrimaryButton />
      </Preview.Footer>
    </Preview.Layout>
  );
};
