import { Body1, H2 } from '@/components/ui/typography';

import { Preview } from '../shared';

export const NutrientsPreview = () => (
  <Preview.Layout backgroundImage="/onboarding/upsell/splashes/nutrient-splash.webp">
    <Preview.Header />
    <Preview.Content>
      <Preview.Label>Suggested based on your goals</Preview.Label>
      <H2 className="text-balance text-white md:text-zinc-900">
        Are you getting the nutrients you need?
      </H2>
      <Body1 className="text-zinc-400 md:text-zinc-500">
        Even with a healthy diet, many people have hidden deficiencies that
        affect energy, mood, and long-term health.
      </Body1>
    </Preview.Content>
    <Preview.Footer>
      <Preview.PrimaryButton />
    </Preview.Footer>
  </Preview.Layout>
);
