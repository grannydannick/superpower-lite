import { usePosthogFeatureFlagEnabled } from '@/hooks/use-posthog-feature-flag-enabled';
import { FeatureFlags } from '@/lib/posthog';

import { LegacyConciergeLayout } from './concierge-layout-legacy';
import { SingleThreadConciergeLayout } from './concierge-layout-single-thread';

export const ConciergeLayout = () => {
  const singleThread = usePosthogFeatureFlagEnabled(
    FeatureFlags.ConciergeSingleThread,
  );

  // While loading the flag, default to legacy to avoid flickering
  if (singleThread === undefined) {
    return <LegacyConciergeLayout />;
  }

  if (singleThread) {
    return <SingleThreadConciergeLayout />;
  }

  return <LegacyConciergeLayout />;
};
