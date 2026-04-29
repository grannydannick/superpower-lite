import * as React from 'react';

/**
 * Reads the variant key for a multivariate PostHog feature flag.
 * Returns the variant string (e.g. 'control' | 'treatment'), or undefined
 * when posthog isn't ready yet or the user isn't bucketed.
 *
 * Mirrors the shape of `usePosthogFeatureFlagEnabled` so the two hooks
 * behave the same way around posthog readiness and unmount.
 */
export const usePosthogFeatureFlagVariantKey = (flagKey: string) => {
  const [variant, setVariant] = React.useState<string | undefined>(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const client = window.posthog;
    if (client == null) {
      return undefined;
    }
    const value = client.getFeatureFlag(flagKey);
    return typeof value === 'string' ? value : undefined;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const subscribe = () => {
      const client = window.posthog;
      if (client == null) {
        return false;
      }

      const update = () => {
        const value = client.getFeatureFlag(flagKey);
        setVariant(typeof value === 'string' ? value : undefined);
      };

      unsubscribe = client.onFeatureFlags(update);
      update();
      return true;
    };

    if (subscribe()) {
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }

    const onReady = () => {
      if (subscribe()) {
        window.removeEventListener('posthog:ready', onReady);
      }
    };

    window.addEventListener('posthog:ready', onReady);
    return () => {
      window.removeEventListener('posthog:ready', onReady);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [flagKey]);

  return variant;
};
