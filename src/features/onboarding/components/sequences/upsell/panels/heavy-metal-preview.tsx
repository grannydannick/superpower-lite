import { Body1, H2 } from '@/components/ui/typography';

import { Preview } from '../shared';

export const HeavyMetalPreview = () => (
  <Preview.Layout backgroundImage="/onboarding/upsell/splashes/heavy-metal-splash.webp">
    <Preview.Header />
    <Preview.Content>
      <Preview.Label>Suggested based on your goals</Preview.Label>
      <H2 className="text-balance text-white md:text-zinc-900">
        Heavy metals stay in the body longer than you think
      </H2>
      <Body1 className="text-zinc-400 md:text-zinc-500">
        Heavy metals can accumulate quietly over time and interfere with nerves,
        kidneys, and energy.
      </Body1>
    </Preview.Content>
    <Preview.Footer>
      <Preview.PrimaryButton />
    </Preview.Footer>
  </Preview.Layout>
);
