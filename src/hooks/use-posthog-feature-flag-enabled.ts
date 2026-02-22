import * as React from 'react';

export const usePosthogFeatureFlagEnabled = (flagKey: string) => {
  const [enabled, setEnabled] = React.useState<boolean | undefined>(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const client = window.posthog;
    if (client == null) {
      return undefined;
    }
    return client.isFeatureEnabled(flagKey);
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
        setEnabled(client.isFeatureEnabled(flagKey));
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

  return enabled;
};
