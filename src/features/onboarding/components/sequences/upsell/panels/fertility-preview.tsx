import { Body1, H2 } from '@/components/ui/typography';

import { Preview } from '../shared';

export const FertilityPreview = () => (
  <Preview.Layout
    className="[&_img]:object-[0%_10%]"
    backgroundImage="/onboarding/upsell/splashes/fertility-splash.webp"
  >
    <Preview.Header />
    <Preview.Content>
      <Preview.Label>Suggested based on your goals</Preview.Label>
      <H2 className="text-balance text-white md:text-zinc-900">
        Never ask &quot;am I running out of time?&quot; again
      </H2>
      <Body1 className="text-zinc-400 md:text-zinc-500">
        Your timeline for pregnancy is knowable. Testing your fertility lets you
        better plan your options and know your time horizon for kids.
      </Body1>
    </Preview.Content>
    <Preview.Footer>
      <Preview.PrimaryButton />
    </Preview.Footer>
  </Preview.Layout>
);
