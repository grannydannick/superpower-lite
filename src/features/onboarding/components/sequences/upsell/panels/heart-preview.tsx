import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';

import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Preview } from '../shared';

export const HeartPreview = () => {
  const { next } = useSequence();

  return (
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
          cholesterol levels. Most doctors don&apos;t test the markers you need
          to know your risks.
        </Body1>
      </Preview.Content>
      <Preview.Footer>
        <Button
          onClick={next}
          variant="white"
          className="w-full md:bg-zinc-900 md:text-white md:hover:bg-zinc-800"
        >
          See testing options
        </Button>
        <Preview.SkipButton>
          I&apos;m fine with ignoring this
        </Preview.SkipButton>
      </Preview.Footer>
    </Preview.Layout>
  );
};
