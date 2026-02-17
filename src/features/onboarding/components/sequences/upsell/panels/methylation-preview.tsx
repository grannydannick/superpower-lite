import { Body1, H2 } from '@/components/ui/typography';
import { useGender } from '@/hooks/use-gender';

import { Preview } from '../shared';

export const MethylationPreview = () => {
  const { gender } = useGender();

  const backgroundImage =
    gender === 'female'
      ? '/onboarding/upsell/gender/methy-female.webp'
      : '/onboarding/upsell/gender/methy-male.webp';

  return (
    <Preview.Layout backgroundImage={backgroundImage}>
      <Preview.Header />
      <Preview.Content>
        <Preview.Label>Suggested based on your goals</Preview.Label>
        <H2 className="text-balance text-white md:text-zinc-900">
          Healthy aging starts at the cellular level
        </H2>
        <Body1 className="text-zinc-400 md:text-zinc-500">
          Methylation supports how efficiently your body uses nutrients for
          energy, DNA repair, and brain function.
        </Body1>
      </Preview.Content>
      <Preview.Footer>
        <Preview.PrimaryButton />
      </Preview.Footer>
    </Preview.Layout>
  );
};
