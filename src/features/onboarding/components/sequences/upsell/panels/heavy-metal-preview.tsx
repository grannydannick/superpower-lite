import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Preview } from '../shared';

export const HeavyMetalPreview = () => {
  const { next } = useSequence();

  return (
    <Preview.Layout backgroundImage="/onboarding/upsell/splashes/heavy-metal-splash.webp">
      <Preview.Header />
      <Preview.Content>
        <Preview.Label>Suggested based on your goals</Preview.Label>
        <H2 className="text-balance text-white md:text-zinc-900">
          Heavy metals stay in the body longer than you think
        </H2>
        <Body1 className="text-zinc-400 md:text-zinc-500">
          Heavy metals can accumulate quietly over time and interfere with
          nerves, kidneys, and energy.
        </Body1>
      </Preview.Content>
      <Preview.Footer>
        <Button
          onClick={next}
          variant="white"
          className="w-full md:bg-zinc-900 md:text-white md:hover:bg-zinc-800"
        >
          See testing option
        </Button>
        <Preview.SkipButton>
          I&apos;m fine with ignoring this
        </Preview.SkipButton>
      </Preview.Footer>
    </Preview.Layout>
  );
};
