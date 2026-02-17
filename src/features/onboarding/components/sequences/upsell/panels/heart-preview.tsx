import { Body1, H2 } from '@/components/ui/typography';

import { Preview } from '../shared';

export const HeartPreview = () => (
  <Preview.Layout
    backgroundImage="/onboarding/upsell/splashes/cardiovascular-splash.webp"
    className="[&_img]:object-[0%_20%]"
  >
    <Preview.Header />
    <Preview.Content>
      <Preview.Label>Suggested based on your goals</Preview.Label>
      <H2 className="text-balance text-white md:text-zinc-900">
        Heart disease is a silent killer
      </H2>
      <Body1 className="text-zinc-400 md:text-zinc-500">
        3 out of 4 Americans who had heart attacks had &quot;normal&quot;
        cholesterol levels. Most doctors don&apos;t test the markers you need to
        know your risks.
      </Body1>
    </Preview.Content>
    <Preview.Footer>
      <Preview.PrimaryButton />
    </Preview.Footer>
  </Preview.Layout>
);
